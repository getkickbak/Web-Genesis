class BadgeToType
  include DataMapper::Resource

  belongs_to :badge, :key => true
  belongs_to :badge_type, :key => true
end