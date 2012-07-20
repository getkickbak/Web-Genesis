 class CustomerRewardToSubtype
  include DataMapper::Resource

  belongs_to :customer_reward, :key => true
  belongs_to :customer_reward_subtype, :key => true
end