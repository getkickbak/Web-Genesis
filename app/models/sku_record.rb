require 'util/constant'

class SkuRecord
  include DataMapper::Resource

  property :id, Serial
  property :sku_id, String, :required => true
  property :venue_id, Integer, :required => true
  property :txn_id, Integer, :required => true
  property :price, Decimal, :scale => 2, :required => true
  property :quantity, Integer, :required => true
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :sku_id, :venue_id, :txn_id, :price, :quantity
  
  belongs_to :merchant
  belongs_to :customer
  belongs_to :user
end