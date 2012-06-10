require 'util/constant'

class TransactionRecord
  include DataMapper::Resource

  property :id, Serial
  property :type, Enum[:earn, :redeem, :transfer, :expire, :adjust], :required => true
  property :ref_id, Integer, :default => 0
  property :description, String, :required => true, :default => ""
  property :points, Integer, :required => true, :default => 0
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :type, :ref_id, :description, :points, :created_ts, :update_ts
  
  belongs_to :merchant
  belongs_to :customer
  belongs_to :user
end 