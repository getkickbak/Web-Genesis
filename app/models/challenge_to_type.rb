class ChallengeToType
  include DataMapper::Resource

  belongs_to :challenge, :key => true
  belongs_to :challenge_type, :key => true
end