class MerchantBadgeTypeImage
  include DataMapper::Resource
  
  property :merchant_badge_type_id, Integer, :key => true
  property :thumbnail_url, String, :required => true, :default => ""
end