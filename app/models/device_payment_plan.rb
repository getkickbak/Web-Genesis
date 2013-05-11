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
end