class CustomerReward < Reward 
  
  def self.create(merchant, reward_info)
    now = Time.now
    reward = CustomerReward.new(
      :title => reward_info[:title],
      :points => reward_info[:points]
    )
    reward[:created_ts] = now
    reward[:update_ts] = now
    reward.merchant = merchant
    reward.save
    return reward
  end
end