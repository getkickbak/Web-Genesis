class ChallengeVenue
  include DataMapper::Resource

  belongs_to :challenge, :key => true
  belongs_to :venue, :key => true
end