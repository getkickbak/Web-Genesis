require 'util/constant'

class UserProfile
  include DataMapper::Resource
  
  property :id, Serial
  property :gender, Enum[:m, :f, :u], :default => :u
  property :birthday, Date, :default => ::Constant::MIN_DATE
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :gender, :birthday
  
  belongs_to :user
  
  def update(profile_info)
    now = Time.now
    self.attributes = profile_info
    self.update_ts = now
    save
  end
end