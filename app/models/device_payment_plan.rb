require 'util/constant'

class DevicePaymentPlan
  include DataMapper::Resource
    
  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :description, String, :required => true, :default => ""
  property :price_wifi, Decimal, :scale => 2, :required => true, :default => 0.00
  property :price_internet, Decimal, :scale => 2, :required => true, :default => 0.00
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  def self.create(payment_plan_info)
    now = Time.now
    payment_plan = DevicePaymentPlan.new(
      {
        :name => payment_plan_info[:name],
        :description => payment_plan_info[:description],
        :price_wifi => payment_plan_info[:price_wifi],
        :price_internet => payment_plan_info[:price_internet]
      }.delete_if { |k,v| v.nil? }
    )
    payment_plan[:created_ts] = now
    payment_plan[:update_ts] = now
    payment_plan.save
    return payment_plan
  end
end