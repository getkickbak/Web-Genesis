module ShareOnFacebook
  @queue = :share_on_facebook
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/share_on_facebook.log")
  end

  def self.perform(user_id, posts)
    begin
      user = User.get(use_id)
      Common.connect_to_facebook(user, posts)
    rescue Koala::Facebook::APIError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Share on Facebook failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Share on Facebook failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    end
  end
end