class BadgeTypeSetting
  include DataMapper::Resource

  property :visits, Integer, :required => true, :default => 0
  property :visit_frequency_type_id, Integer, :key => true
  property :badge_type_id, Integer, :key => true
end