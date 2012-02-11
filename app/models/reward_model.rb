require 'util/constant'

class RewardModel
  include DataMapper::Resource
  
  property :id, Serial
  property :rebate_rate, Integer, :required => true
  property :prize_rebate_rate, Integer, :required => true
  property :price_per_point, Decimal, :scale => 2, :default => 0.10
  property :prize_reward_id, Integer, :default => 0
  property :prize_point_offset, Integer, :default => 0
  property :prize_win_offset, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  attr_accessible :rebate_rate, :prize_rebate_rate, :price_per_point, :prize_reward_id, :prize_point_offset, :prize_win_offset
  
  belongs_to :merchant
  
  validates_with_method :check_rebate_rate
  validates_with_method :check_prize_rebate_rate
  validates_with_method :check_price_per_point
  
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
  
  private
  
  def check_rebate_rate
    if self.rebate_rate.is_a? Integer
      return self.rebate_rate > 0 ? true : [false, "Rebate rate must be greater than 0"]  
    end
    return true
  end
  
  def check_prize_rebate_rate
    if self.prize_rebate_rate.is_a? Integer
      return self.prize_rebate_rate > 0 ? true : [false, "Prize rebate rate must be greater than 0"]  
    end
    return true
  end
  
  def check_price_per_point
    if self.price_per_point.is_a? Decimal
      return self.price_per_point > 0.0 ? true : [false, "Price per point must be greater than 0"]
    end
    return true
  end
end