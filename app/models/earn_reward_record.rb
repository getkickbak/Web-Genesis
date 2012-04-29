require 'util/constant'

class EarnRewardRecord
  include DataMapper::Resource

  property :id, Serial
  property :challenge_id, Integer, :default => 0
  property :venue_id, Integer, :required => true, :default => 0
  property :auth_data, String, :unique_index => true, :required => true, :default => ""
  property :points, Integer, :required => true, :default => 0
  property :amount, Decimal, :scale => 2, :default => 0.00
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :challenge_id, :venue_id, :auth_data, :points, :amount, :created_ts
  
  belongs_to :merchant
  belongs_to :user
end