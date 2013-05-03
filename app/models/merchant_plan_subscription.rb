require 'util/constant'

class MerchantPlanSubscription
  include DataMapper::Resource
  
  property :id, Serial
  property :subscription_id, String, :required => true, :default => ""
  property :payment_token, String, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :subscription_id, :payment_token
    
  belongs_to :merchant
    
  def self.create(subscription_info)
    now = Time.now
    subscription = MerchantPlanSubscription.new(
      :subscription_id => subscription_info[:subscription_id],
      :payment_token => subscription_info[:payment_token]
    )
    subscription[:created_ts] = now
    subscription[:update_ts] = now
    subscription.save
    return subscription
  end
end