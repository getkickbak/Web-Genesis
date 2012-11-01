class BadgeTypeImage
  include DataMapper::Resource
  
  @@thumbnail_url_path = {}
  
  property :badge_type_id, Integer, :key => true
  property :thumbnail_url, String, :required => true, :default => ""
  
  def self.thumbnail_url_path
    @@thumbnail_url_path
  end
  
  def self.thumbnail_url_path=(thumbnail_url_path)
    @@thumbnail_url_path = thumbnail_url_path
  end
end