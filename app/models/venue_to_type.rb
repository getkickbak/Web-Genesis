class VenueToType
  include DataMapper::Resource

  belongs_to :venue, :key => true
  belongs_to :venue_type, :key => true
end