class MerchantCreditCard
  include DataMapper::Resource

  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :credit_card, :key => true
  belongs_to :merchant, :key => true
end