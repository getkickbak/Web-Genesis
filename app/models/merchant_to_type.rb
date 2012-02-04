class MerchantToType
  include DataMapper::Resource

  belongs_to :merchant, :key => true
  belongs_to :merchant_type, :key => true
end