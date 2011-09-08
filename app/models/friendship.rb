class Friendship
  include DataMapper::Resource

  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  belongs_to :source, 'User', :key => true
  belongs_to :target, 'User', :key => true
end
