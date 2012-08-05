class MerchantBadgeType
  include DataMapper::Resource
  
  property :id, Serial
  property :rank, Integer, :required => true, :default => 0
        
  attr_accessor :display_value, :thumbnail_small_url, :thumbnail_medium_url, :thumbnail_large_url
  
  belongs_to :merchant
end