class RewardModelToType
  include DataMapper::Resource

  belongs_to :reward_model, :key => true
  belongs_to :reward_model_type, :key => true
end