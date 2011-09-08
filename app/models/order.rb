require 'util/constant'

class Order
  include DataMapper::Resource

  property :id, Serial
  property :order_id, String, :unique_index => true, :default => 0
  property :user_id, Integer, :default => 0
  property :subdeal_id, Integer, :required => true
  property :referral_id, Integer, :default => 0
  property :quantity, Integer, :required => true
  property :purchase_date, DateTime, :default => ::Constant::MIN_TIME
  property :total_payment, Decimal, :scale => 2, :default => 0
  property :payment_confirmed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :subdeal_id, :quantity

  belongs_to :deal
  has n, :coupons
  
  validates_with_method :check_deal_max_limit, :check_deal_max_per_person, :check_end_date
  
  def self.create(deal, subdeal, user_id, referral_id, order_info)
    now = Time.now
    quantity = order_info[:quantity].to_i
    order = Order.new(
      :subdeal_id => order_info[:subdeal_id],
      :quantity => quantity
    )
    order[:order_id] = "#{rand(1000) + 2000}#{now.to_i}"
    order[:user_id] = user_id
    order[:referral_id] = referral_id
    order[:purchase_date] = now
    order[:total_payment] = quantity * subdeal.discount_price
    order[:created_ts] = now
    order[:update_ts] = now
    order.deal = deal
    
    #qr = RQR::QRCode.new()
    coupon_id = "#{rand(1000) + 3000}#{now.to_i}"
    (0..quantity-1).each do |i|
      coupon = order.coupons.new
      coupon[:coupon_id] = "#{coupon_id}-#{i}"
      coupon[:barcode] = ""
      #url = "http://www.cnn.com"
      #filename = "where_is_this_" + coupon[:coupon_id]
      #qr.save(url, filename, :png)
      #coupoon[:qr_code] = filename
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
  
  private
  
  def check_deal_max_limit
    (self.deal.limit_count + self.quantity) <= self.deal.max_limit ? true : [false, "Exceeded Deal Max Limit"]
  end
  
  def check_deal_max_per_person
    (self.quantity + past_orders_quantity) <= self.deal.max_per_person ? true : [false, "Exceeded Max Per Person Limit"]
  end
  
  def check_end_date
    Time.now <= self.deal.end_date ? true : [false, "Deal has expired"]
  end
  
  def past_orders_quantity
    total_count = DataMapper.repository(:default).adapter.select(
      "SELECT SUM(quantity) FROM orders WHERE user_id = ? 
        AND deal_id = ? AND payment_confirmed = 't'", self.user_id, self.deal.id
    )
    return total_count[0]
  end
end
