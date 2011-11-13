require 'util/constant'
require 'util/common'
require 'aws/s3'
require 'guid'

class Order
  include DataMapper::Resource

  property :id, Serial
  property :order_id, String, :unique_index => true, :default => 0
  property :subdeal_id, Integer, :required => true, :default => 0, :messages => { :presence => "Please pick a Deal" }
  property :referral_id, Integer, :default => 0
  property :new_customer, Boolean, :default => true
  property :quantity, Integer, :required => true, :default => 0
  property :purchase_date, DateTime, :default => ::Constant::MIN_TIME
  property :total_payment, Decimal, :scale => 2, :default => 0
  property :payment_confirmed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :subdeal_id, :quantity, :gift_option_attributes

  belongs_to :deal
  belongs_to :user
  has 1, :gift_option
  has n, :coupons
  
  accepts_nested_attributes_for :gift_option, :allow_destroy => true
  
  validates_with_method :check_quantity, :check_deal_max_limit, :check_deal_max_per_person, :check_end_date
  
  def self.create(deal, subdeal, user, referral_id, new_customer, order_info, agree_to_terms)
    now = Time.now
    quantity = order_info[:quantity].to_i
    
    give_gift = order_info[:give_gift].to_bool
    if give_gift
      order = Order.new(
        :subdeal_id => order_info[:subdeal_id],
        :quantity => quantity,
        :gift_option_attributes => order_info[:gift_option_attributes]
      )
    else
      order = Order.new(
        :subdeal_id => order_info[:subdeal_id],
        :quantity => quantity
      )
    end 
    
    order[:order_id] = "#{rand(1000) + 2000}#{now.to_i}"
    order[:referral_id] = referral_id
    order[:new_customer] = new_customer
    order[:purchase_date] = now
    order[:total_payment] = quantity * (subdeal ? subdeal.discount_price : 0)
    order[:created_ts] = now
    order[:update_ts] = now
    order.deal = deal
    order.user = user
    
    coupon_id = "#{rand(1000) + 3000}#{now.to_i}"
    (0..quantity-1).each do |i|
      coupon = order.coupons.new
      coupon[:coupon_id] = "#{coupon_id}-#{i+1}"
      qr = RQRCode::QRCode.new( coupon[:coupon_id], :size => 5, :level => :h )
      png = qr.to_img.resize(90,90)
      coupon[:coupon_title] = subdeal.coupon_title
      coupon[:paid_amount] = subdeal.discount_price
      coupon[:expiry_date] = deal.expiry_date
      coupon[:barcode] = ""
      AWS::S3::S3Object.store(
        ::Common.generate_voucher_file_path(user,"#{coupon[:coupon_id]}.png"), 
        png.to_string, 
        APP_PROP["AMAZON_FILES_BUCKET"], 
        :content_type => 'image/png', 
        :access => :public_read
      )
      filename = ::Common.generate_full_voucher_file_path(user,"#{coupon[:coupon_id]}.png")
      coupon[:qr_code] = filename
      coupon[:created_ts] = now
      coupon[:update_ts] = now
      coupon.deal = deal
      coupon.user = user
    end
    order.save
    if agree_to_terms.nil? 
       order.errors.add(:base, "Please agree to Terms Of Use and Privacy Agreement")
       raise DataMapper::SaveFailureError.new("",order)
    end
    deal[:limit_count] += order.quantity
    deal.save
    return order
  end
  
  def self.find(user_id, start, max)
    count = Order.count(Order.user.id => user_id) || 0
    orders = Order.all(Order.user.id => user_id, :offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = orders
    #return result
    return orders
  end
  
  def self.find_referred_by(referrer_id, start, max)
    count = Order.count(:referrer_id => referrer_id) || 0
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
    Date.today <= self.deal.end_date.to_date ? true : [false, "Deal is over"]
  end
  
  def past_orders_quantity
    Order.sum(:quantity, Order.user.id => self.user.id, Order.deal.id => self.deal.id, :payment_confirmed => true) || 0
  end
end
