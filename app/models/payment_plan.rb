require 'util/constant'

class PaymentPlan
  include DataMapper::Resource
  
  @@id_to_plan = {}
  
  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :description, String, :required => true, :default => ""
  property :avg_member_count, Integer, :required => true, :default => 0
  property :price_wifi, Decimal, :scale => 2, :required => true, :default => 0.00
  property :price_internet, Decimal, :scale => 2, :required => true, :default => 0.00
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :name, :description, :avg_member_count, :price_wifi, :price_internet
    
  def self.create(payment_plan_info)
    now = Time.now
    payment_plan = PaymentPlan.new(
      {
        :name => payment_plan_info[:name],
        :description => payment_plan_info[:description],
        :avg_member_count => payment_plan_info[:avg_member_count],
        :price_wifi => payment_plan_info[:price_wifi],
        :price_internet => payment_plan_info[:price_internet]
      }.delete_if { |k,v| v.nil? }
    )
    payment_plan[:created_ts] = now
    payment_plan[:update_ts] = now
    payment_plan.save
    return payment_plan
  end
  
  def self.id_to_plan
    @@id_to_plan
  end
  
  def self.id_to_plan=(id_to_plan)
    @@id_to_plan = id_to_plan
  end
end