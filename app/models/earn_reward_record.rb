require 'util/constant'

class EarnRewardRecord
  include DataMapper::Resource

  property :id, Serial
  property :reward_id, Integer, :default => 0
  property :challenge_id, Integer, :default => 0
  property :points, Integer, :required => true, :default => 0
  property :time, DateTime, :required => true, :default => ::Constant::MIN_TIME
  
  attr_accessible :reward_id, :challenge_id, :points, :time
  
  belongs_to :merchant
  belongs_to :user
end