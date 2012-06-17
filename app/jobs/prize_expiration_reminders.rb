module PrizeExpirationReminders
  @queue = :prize_expiration_reminders
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/prize_expiration_reminders.log")
  end
  
  def self.perform()
=begin    
    if Rails.env == 'production'
      sql = "SELECT id FROM earn_prize WHERE user_id = ? AND redeemed = false
              AND expiry_date > ? AND (DATEDIFF(expiry_date - ?) % 30 = 0 OR DATEDIFF(expiry_date - ?) = 5) AND deleted_ts IS NULL"
    else
      sql = "SELECT id FROM earn_prize WHERE user_id = ? AND redeemed = false
              AND expiry_date > ? AND ((julianday(strftime('%Y-%m-%d',expiry_date)) - julianday(strftime('%Y-%m-%d',?))) % 30 = 0 OR (julianday(strftime('%Y-%m-%d',expiry_date)) - julianday(strftime('%Y-%m-%d',?))) = 5) AND deleted_ts IS NULL"          
    end
    now = Time.now
    logger.info("Prize Expiration Reminders started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    users = User.all
    users.each do |user|
      prize_ids = DataMapper.repository(:default).adapter.select(
        sql, user.id, now, now, now
      )
      if prize_ids.length > 0
        #logger.debug("User(#{user.name}) #{coupon_ids}")
        prizes = EarnPrize.all(:id => prize_ids)
        UserMailer.prize_expiration_reminder_email(user, prizes).deliver
      end
    end
    now = Time.now
    logger.info("Prize Expiration Reminders completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
=end    
  end
end