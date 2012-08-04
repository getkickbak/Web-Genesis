class BadgeTypeImage
  include DataMapper::Resource

  UserAgents = [:iphone, :android]
  
  property :badge_type_id, Integer, :key => true
  property :user_agent, Enum[:iphone, :android], :key => true
  property :thumbnail_small_url, String, :required => true, :default => ""
  property :thumbnail_medium_url, String, :required => true, :default => ""
  property :thumbnail_large_url, String, :required => true, :default => ""
end