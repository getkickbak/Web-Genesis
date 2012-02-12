class MerchantCreditCard
  include DataMapper::Resource

  belongs_to :credit_card, :key => true
  belongs_to :merchant, :key => true
end