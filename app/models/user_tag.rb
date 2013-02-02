require 'util/constant'

class UserTag
  include DataMapper::Resource
  
  Statuses = [:active, :pending, :virtual, :suspended, :deleted]
  
  property :id, Serial
  property :tag_id, String, :unique_index => true, :required => true, :default => ""
  property :status, Enum[:active, :pending, :virtual, :suspended, :deleted], :required => true, :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  def self.create(status = :pending, tag_id = nil)
    now = Time.now
    user_tag = UserTag.new(
      :tag_id => String.random_alphanumeric,
      :status => status
    )
    user_tag[:created_ts] = now
    user_tag[:update_ts] = now
    user_tag.save!
    n1 = (now.to_i / 100) + user_tag.id
    user_tag.tag_id = tag_id || "#{n1}"
    user_tag.save
    return user_tag
  end
end