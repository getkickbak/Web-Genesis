class MerchantToBadge
  include DataMapper::Resource

  belongs_to :merchant, :key => true
  belongs_to :badge, :key => true
end