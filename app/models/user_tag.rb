require 'util/constant'

class UserTag
  include DataMapper::Resource
  
  Statuses = [:active, :pending, :virtual, :suspended, :deleted]
  
  property :id, Serial
  property :tag_id, String, :required => true, :default => ""
  property :status, Enum[:active, :pending, :virtual, :suspended, :deleted], :required => true, :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  def self.create(status = :pending)
    now = Time.now
    user_tag = UserTag.new(
      :tag_id => String.random_alphanumeric,
      :status => status
    )
    user_tag[:created_ts] = now
    user_tag[:update_ts] = now
    user_tag.save!
    n1 = (now.to_i / 60) + user_tag.id
    user_tag.tag_id = "1#{n1}"
    user_tag.save
    return user_tag
  end
end