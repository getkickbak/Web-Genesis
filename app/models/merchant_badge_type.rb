class MerchantBadgeType
  include DataMapper::Resource
  
  property :id, Serial
  property :rank, Integer, :required => true, :default => 0
  property :value, String, :required => true, :default => ""
        
  attr_accessor :thumbnail_small_url, :thumbnail_medium_url, :thumbnail_large_url
  
  belongs_to :merchant
  
  def display_value
    self.value
  end
end