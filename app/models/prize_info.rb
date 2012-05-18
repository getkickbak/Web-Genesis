require 'util/constant'

class PrizeInfo
  include DataMapper::Resource
  
  property :id, Serial
  property :prize_reward_id, Integer, :default => 0
  property :prize_point_offset, Integer, :default => 0
  property :prize_win_offset, Integer, :default => 0
  
  attr_accessible :prize_reward_id, :prize_point_offset, :prize_win_offset
  
  belongs_to :venue
end