class PurchaseRewardToType
  include DataMapper::Resource

  belongs_to :purchase_reward, :key => true
  belongs_to :purchase_reward_type, :key => true
end