class BadgeToMerchantType
  include DataMapper::Resource

  belongs_to :badge, :key => true
  belongs_to :merchant_badge_type, :key => true
end