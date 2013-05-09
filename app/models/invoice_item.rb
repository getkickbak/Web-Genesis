require 'util/constant'

class InvoiceItem
  include DataMapper::Resource
  
  property :id, Serial
  property :description, String, :required => true, :default => ""
  property :quantity, Integer, :required => true, :min => 1, :default => 0
  property :amount, Decimal, :scale => 2, :required => true, :default => 0.00
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :invoice
end