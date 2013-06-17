require 'util/constant'

class InvoiceItem
  include DataMapper::Resource
  
  property :id, Serial
  property :description, String, :required => true, :default => ""
  property :quantity, Integer, :required => true, :min => 1, :default => 0
  property :price, Decimal, :scale => 2, :required => true, :default => 0.00
  property :amount, Decimal, :scale => 2, :required => true, :default => 0.00
  
  belongs_to :invoice
end