require 'util/constant'

class MerchantPaymentSubscription
  include DataMapper::Resource
  
  property :id, Serial
  property :plan_id, Integer, :default => 1
  property :balance, Decimal, :scale => 2, :default => 0.00
  property :start_date, Date, :default => ::Constant::MIN_DATE
  property :end_date, Date, :default => ::Constant::MAX_DATE
  property :paid_through_date, Date, :default => ::Constant::MIN_TIME
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :plan_id, :amount, :balance, :start_date, :end_date, :paid_through_date
  
  belongs_to :merchant
  
  def self.create(merchant, start_date)
    subscription = MerchantPaymentSubscription.new(
      :start_date => start_date
    )
    subscription[:created_ts] = now
    subscription[:update_ts] = now
    subscription.save
    return subscription  
  end
  
  def update(subscription_info)
    self.plan_id = subscription_info[:plan_id] if subscription_info.include? :plan_id
    self.balance = subscription_info[:balance] if subscription_info.include? :balance
    self.start_date = subscription_info[:start_date] if subscription_info.include? :start_date
    self.end_date = subscription_info[:end_date] if subscription_info.include? :end_date
    self.paid_through_date = subscription_info[:paid_through_date] if subscription_info.include? :paid_through_date
    save
  end
end