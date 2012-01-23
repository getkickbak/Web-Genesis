require 'util/constant'

class RewardModel
  include DataMapper::Resource
  
  property :id, Serial
  property :reward_ratio, Integer, :required => true
  property :price_per_point, Decimal, :scale => 2, :required => true
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  attr_accessible :reward_ratio, :price_per_point
  
  belongs_to :merchant
  
  def self.create(merchant, reward_model_info)
    now = Time.now
    reward_model = RewardModel.new(
      :reward_ratio => reward_model_info[:reward_ratio],
      :price_per_point => reward_model_info[:price_per_point]
    )
    reward_model[:created_ts] = now
    reward_model[:update_ts] = now
    reward_model.merchant = merchant
    reward_model.save
    return reward_model
  end
  
  def update(reward_model_info)
    now = Time.now
    self.reward_ratio = reward_model_info[:reward_ratio]
    self.price_per_point = reward_model_info[:price_per_point]
    self.update_ts = now
    save
  end
end