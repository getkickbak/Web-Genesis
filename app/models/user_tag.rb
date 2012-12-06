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
end