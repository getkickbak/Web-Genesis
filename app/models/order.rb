require 'util/constant'

class Order
  include DataMapper::Resource
  include Rails.application.routes.url_helpers

  property :id, Serial
  property :order_id, String, :unique_index => true, :default => 0
  property :subdeal_id, Integer, :required => true, :default => 0, :messages => { :presence => "Please pick a Deal" }
  property :referral_id, Integer, :default => 0
  property :quantity, Integer, :required => true, :default => 0
  property :purchase_date, DateTime, :default => ::Constant::MIN_TIME
  property :total_payment, Decimal, :scale => 2, :default => 0
  property :payment_confirmed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :subdeal_id, :quantity

  belongs_to :deal
  belongs_to :user
  has 1, :gift_option
  has n, :coupons
  
  #accepts_nested_attributes_for :gift_option, :allow_destroy => true, :reject_if => lambda { |s| s[:from].blank? || s[:to].blank? || s[:email].blank? || s[:message].blank? }
  
  validates_with_method :check_quantity, :check_deal_max_limit, :check_deal_max_per_person, :check_end_date
  
  def self.create(deal, subdeal, user, referral_id, order_info)
    now = Time.now
    quantity = order_info[:quantity].to_i
    order = Order.new(
      :subdeal_id => order_info[:subdeal_id],
      :quantity => quantity
    )
    order[:order_id] = "#{rand(1000) + 2000}#{now.to_i}"
    order[:referral_id] = referral_id
    order[:purchase_date] = now
    order[:total_payment] = quantity * (subdeal ? subdeal.discount_price : 0)
    order[:created_ts] = now
    order[:update_ts] = now
    order.deal = deal
    order.user = user
    
    qr = RQR::QRCode.new(:module_size => 3)
    coupon_id = "#{rand(1000) + 3000}#{now.to_i}"
    (0..quantity-1).each do |i|
      coupon = order.coupons.new
      coupon[:coupon_id] = "#{coupon_id}-#{i+1}"
      coupon[:coupon_title] = subdeal.coupon_title
      coupon[:barcode] = ""
      url = deal_url(deal)+"?referral_id=#{referral_id}"
      filename = APP_PROP["QR_CODE_FILE_PATH"] + coupon[:coupon_id] + ".png"
      qr.save(url, filename, :png)
      coupon[:qr_code] = filename
      coupon[:created_ts] = now
      coupon[:update_ts] = now
    end
    order.save
    deal[:limit_count] += order.quantity
    deal.save
    return order
  end
  
  def self.find(user_id, start, max)
    count = Order.count(:user_id => user_id)
    orders = Order.all(:user_id => user_id, :offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = orders
    #return result
    return orders
  end
  
  def self.find_referred_by(referrer_id, start, max)
    count = Order.count(:referrer_id => referrer_id)
    orders = Order.all(:referrer_id => referrer_id, :offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = orders
    #return result
    return orders  
  end
  
  def to_param
    self.order_id
  end
  
  def print_coupons
    self.coupons.each do |coupon|
      coupon.print
    end
  end
  
  private
  
  def check_quantity
    self.quantity > 0 ? true : [false, "Quantity must be greater than 0"]  
  end
  
  def check_deal_max_limit
    if self.deal.max_limit > 0
      (self.deal.limit_count + self.quantity) <= self.deal.max_limit ? true : [false, "Exceeded deal max limit"]
    end
    return true
  end
  
  def check_deal_max_per_person
    (self.quantity + past_orders_quantity) <= self.deal.max_per_person ? true : [false, "Exceeded max per person limit"]
  end
  
  def check_end_date
    Time.now <= self.deal.end_date ? true : [false, "Deal has expired"]
  end
  
  def past_orders_quantity
    total_count = DataMapper.repository(:default).adapter.select(
      "SELECT SUM(quantity) FROM orders WHERE user_id = ? 
        AND deal_id = ? AND payment_confirmed = 't'", self.user.id, self.deal.id
    )
    return total_count[0] ? total_count[0] : 0
  end
end
