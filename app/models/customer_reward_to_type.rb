class CustomerRewardToType
  include DataMapper::Resource

  belongs_to :customer_reward, :key => true
  belongs_to :customer_reward_type, :key => true
end