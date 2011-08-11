class Relationship
  include DataMapper::Resource

  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  belongs_to :follower, 'User', :key => true
  belongs_to :followed, 'User', :key => true

end
