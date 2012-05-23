require 'util/constant'

class TransferPointsRecord
  include DataMapper::Resource

  property :id, Serial
  property :sender_id, Integer, :required => true, :default => 0
  property :recipient_id, Integer, :default => 0
  property :points, Integer, :required => true, :default => 0
  property :status, Enum[:pending, :completed], :default => :pending
  property :expiry_date, Date, :required => true, :default => ::Constant::MIN_TIME
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :sender_id, :recipient_id, :points, :status, :expiry_date, :created_ts
end