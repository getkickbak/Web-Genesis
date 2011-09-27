class Subdeal
  include DataMapper::Resource
  
  property :id, Serial
  property :title, String, :required => true, :default => ""
  property :coupon_title, String, :required => true, :default => ""
  property :regular_price, Decimal, :scale => 2, :required => true
  property :discount_price, Decimal, :scale => 2, :required => true 
  
  belongs_to :deal  
end