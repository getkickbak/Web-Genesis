require 'singleton'

class OrderService
  include Singleton
    
  def create_order(deal, user_id, referral_id, order_info)
    now = Time.now
    quantity = order_info[:quantity].to_i
    order = Order.new(
      :quantity => quantity
    )
    order[:order_num] = 0
    order[:user_id] = user_id
    order[:referral_id] = referral_id
    order[:purchase_date] = now
    order[:total_payment] = quantity * deal.discount_price
    order[:created_ts] = now
    order[:update_ts] = now
    order.deal = deal
    (0..quantity-1).each do |i|
      coupon = order.coupons.new
      coupon[:barcode] = "1234"
      coupon[:created_ts] = now
      coupon[:update_ts] = now
    end
    order.save
    return order
  end
  
  def get_order(order_id)
    Order.get!(order_id)
  end
  
  def get_orders(user_id, start, max)
    count = Order.count(:user_id => user_id)
    orders = Order.all(:user_id => user_id, :offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = orders
    #return result
    return orders
  end
  
  def get_orders_referred_by(referrer_id, start, max)
    count = Order.count(:referrer_id => referrer_id)
    orders = Order.all(:referrer_id => referrer_id, :offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = orders
    #return result
    return orders  
  end
  
end