class RedeemedReward

  TYPE_PRIZE = "prize"
  TYPE_REWARD = "reward"
  
  def initialize(id, type, title)
    @id = id
    @type = type
    @title = title
  end
end