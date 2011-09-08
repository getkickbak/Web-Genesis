require 'util/constant'

class Coupon
  include DataMapper::Resource

  property :id, Serial
  property :coupon_id, String, :unique_index => true, :default => 0
  property :barcode, String, :default => ""
  property :qr_code, String, :default => ""
  property :redeemed, Boolean, :default => false 
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :used
  
  belongs_to :order
end
