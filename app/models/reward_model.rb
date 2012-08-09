require 'util/constant'

class RewardModel
  include DataMapper::Resource
  
  property :id, Serial
  property :signup_amount, Decimal, :required => true, :min => 1.00
  property :signup_points, Integer, :required => true, :min => 1
  property :rebate_rate, Integer, :required => true, :min => 1
  property :prize_rebate_rate, Integer, :required => true, :min => 1
  property :price_per_point, Decimal, :scale => 2, :min => 1.00, :default => 1.00
  property :price_per_prize_point, Decimal, :scale => 2, :min => 1.00, :default => 1.00
  property :total_spend, Decimal, :scale => 2, :default => 0.00
  property :total_visits, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  attr_accessible :signup_amount, :signup_points, :rebate_rate, :prize_rebate_rate, :price_per_point, :price_per_prize_point
  
  belongs_to :merchant
  
  def self.create(merchant, reward_model_info)
    now = Time.now
    reward_model = RewardModel.new(
      :signup_amount => reward_model_info[:signup_amount],
      :signup_points => reward_model_info[:signup_points],
      :rebate_rate => reward_model_info[:rebate_rate],
      :prize_rebate_rate => reward_model_info[:prize_rebate_rate]
      #:price_per_point => reward_model_info[:price_per_point],
      #:price_per_prize_point => reward_model_info[:price_per_prize_point]
    )
    reward_model[:created_ts] = now
    reward_model[:update_ts] = now
    reward_model.merchant = merchant
    reward_model.save
    return reward_model
  end
  
  def update(reward_model_info)
    now = Time.now
    self.signup_amount = reward_model_info[:signup_amount]
    self.signup_points = reward_model_info[:signup_points]
    self.rebate_rate = reward_model_info[:rebate_rate]
    self.prize_rebate_rate = reward_model_info[:prize_rebate_rate]
    #self.price_per_point = reward_model_info[:price_per_point]
    #self.price_per_prize_point = reward_model_info[:price_per_prize_point]
    self.update_ts = now
    save
  end
end