require 'util/constant'

class Merchant
  include DataMapper::Resource

  property :id, Serial
  property :name, String, :required => true
  property :address, String, :required => true
  property :phone, String, :required => true
  property :latitude, Decimal, :scale => 6, :default => 0
  property :longtitude, Decimal, :scale => 6, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :name, :address, :phone

  has n, :deals
end
