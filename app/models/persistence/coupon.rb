class Coupon
  include DataMapper::Resource

  property :id, Serial
  property :barcode, String, :required => true
  property :used, Boolean, :default => false 
  property :created_ts, DateTime, :required => true
  property :update_ts, DateTime, :required => true
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :used
  
  belongs_to :order
end
