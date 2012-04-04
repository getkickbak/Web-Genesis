require 'util/constant'

class RewardModel
  include DataMapper::Resource
  
  property :id, Serial
  property :rebate_rate, Integer, :required => true, :min => 1
  property :prize_rebate_rate, Integer, :required => true, :min => 1
  property :price_per_point, Decimal, :scale => 2, :min => 0.10, :default => 0.10
  property :prize_reward_id, Integer, :default => 0
  property :prize_point_offset, Integer, :default => 0
  property :prize_win_offset, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  attr_accessible :rebate_rate, :prize_rebate_rate, :price_per_point, :prize_reward_id, :prize_point_offset, :prize_win_offset
  
  belongs_to :merchant
  
  def self.create(merchant, reward_model_info)
    now = Time.now
    reward_model = RewardModel.new(
      :rebate_rate => reward_model_info[:rebate_rate],
      :prize_rebate_rate => reward_model_info[:prize_rebate_rate]
      #:price_per_point => reward_model_info[:price_per_point]
    )
    reward_model[:created_ts] = now
    reward_model[:update_ts] = now
    reward_model.merchant = merchant
    reward_model.save
    return reward_model
  end
  
  def update(reward_model_info)
    now = Time.now
    self.rebate_rate = reward_model_info[:rebate_rate]
    self.prize_rebate_rate = reward_model_info[:prize_rebate_rate]
    #self.price_per_point = reward_model_info[:price_per_point]
    self.update_ts = now
    save
  end
end