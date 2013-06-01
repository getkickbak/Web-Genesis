require 'util/constant'

class ReceiptFilter
  include DataMapper::Resource
  
  property :id, Serial
  property :min_line_length, Integer, :default => 0
  property :grand_total, String, :default => ""
  property :subtotal, String, :default => ""
  property :item, String, :default => ""
  property :table, String, :default => ""    
end