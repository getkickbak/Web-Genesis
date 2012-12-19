require 'util/constant'

class UserTag
  include DataMapper::Resource
  
  Statuses = [:active, :pending, :suspended, :deleted]
  
  property :id, Serial
  property :tag_id, String, :required => true, :default => ""
  property :status, Enum[:active, :pending, :suspended, :deleted], :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  def self.create
    now = Time.now
    user_tag = UserTag.new(
      :tag_id => String.random_alphanumeric
    )
    user_tag[:created_ts] = now
    user_tag[:update_ts] = now
    user_tag.save
    n1 = (now.to_i / 3600) + user_tag.id
    user_tag.tag_id = "1#{n1}"
    user_tag.save
    return user_tag
  end
end