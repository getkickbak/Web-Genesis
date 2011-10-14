class UserProfile
  include DataMapper::Resource

  property :id, Serial
  property :gender, Enum[:m, :f, :u], :required => true, :default => :u
  property :birthday, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :zipcode, String, :default => ""
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :user
  
  
  def update(profile_info)
    now = Time.now
    self.attributes = profile_info
    self.update_ts = now
    save 
  end
  
end
