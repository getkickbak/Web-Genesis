class Subdeal
  include DataMapper::Resource
  
  property :id, Serial
  property :title, String, :required => true, :default => ""
  property :coupon_title, String, :required => true, :default => ""
  property :regular_price, Decimal, :scale => 2, :required => true
  property :discount_price, Decimal, :scale => 2, :required => true 
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :deal  
end