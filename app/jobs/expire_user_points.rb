module ExpireUserPoints
  @queue = :expire_user_points
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/expire_user_points.log")
  end

  def self.perform(auto)
    now = Time.now
    logger.info("Expire User Points started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    logger.info("Expire User Points completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end