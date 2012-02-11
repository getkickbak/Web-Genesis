require 'util/constant'

class RedeemRewardRecord
  include DataMapper::Resource

  property :id, Serial
  property :reward_id, Integer, :required => true, :default => 0
  property :venue_id, Integer, :required => true, :default => 0
  property :points, Integer, :required => true, :default => 0
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :reward_id, :venue_id, :points, :created_ts
  
  belongs_to :merchant
  belongs_to :user
end