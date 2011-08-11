class UserProfile
  include DataMapper::Resource

  property :id, Serial
  property :gender, Enum[:m, :f, :u], :required => true
  property :birthday, DateTime, :required => true
  property :zipcode, String, :default => ""
  property :created_ts, DateTime, :required => true
  property :update_ts, DateTime, :required => true
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  belongs_to :user
end
