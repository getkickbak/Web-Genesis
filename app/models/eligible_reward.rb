class EligibleReward
  attr_accessor :reward_id, :reward_title, :points_difference
  
  def initialize(reward_id, reward_title, points_difference)  
    @reward_id = reward_id
    @reward_title = reward_title
    @points_difference = points_difference
  end
end