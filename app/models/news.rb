class EligibleReward
  attr_accessor :reward_id, :reward_type, :reward_title, :reward_text
  
  def initialize(reward_id, reward_type, reward_title, reward_text)  
    @reward_id = reward_id
    @reward_type = reward_type
    @reward_title = reward_title
    @reward_text = reward_text
  end
end