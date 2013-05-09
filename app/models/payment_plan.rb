require 'util/constant'

class PaymentPlan
  include DataMapper::Resource
  
  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :description, String, :required => true, :default => ""
  property :avg_member_count, Integer, :required => true, :default => 0
  property :price, Decimal, :scale => 2, :required => true, :default => 0.00
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :name, :description, :avg_member_count, :price
    
  def self.create(payment_plan_info)
    now = Time.now
    payment_plan = PaymentPlan.new(
      :name => payment_plan_info[:name],
      :description => payment_plan_info[:description],
      :avg_member_count => payment_plan_info[:avg_member_count],
      :price => payment_plan_info[:price]
    )
    payment_plan[:created_ts] = now
    payment_plan[:update_ts] = now
    payment_plan.save
    return payment_plan
  end
end