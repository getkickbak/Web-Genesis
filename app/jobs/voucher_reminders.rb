module VoucherReminders
  @queue = :voucher_reminders
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/reminders.log")
  end
  
  def self.perform()
=begin    
    if RAILS_ENV == 'production'
      sql = "SELECT coupon_id FROM coupons WHERE user_id = ? 
              AND expiry_date > ? AND (DATEDIFF(expiry_date - ?) % 30 = 0 OR DATEDIFF(expiry_date - ?) = 5) AND deleted_ts IS NULL"
    else
      sql = "SELECT coupon_id FROM coupons WHERE user_id = ? 
              AND expiry_date > ? AND ((julianday(strftime('%Y-%m-%d',expiry_date)) - julianday(strftime('%Y-%m-%d',?))) % 30 = 0 OR (julianday(strftime('%Y-%m-%d',expiry_date)) - julianday(strftime('%Y-%m-%d',?))) = 5) AND deleted_ts IS NULL"          
    end
    now = Time.now
    logger.info("VoucherReminders started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    users = User.all
    users.each do |user|
      coupon_ids = DataMapper.repository(:default).adapter.select(
        sql, user.id, now, now, now
      )
      if coupon_ids.length > 0
        #logger.debug("User(#{user.name}) #{coupon_ids}")
        coupons = Coupon.all(:coupon_id => coupon_ids)
        UserMailer.voucher_reminder_email(user,coupons).deliver
      end
    end
    logger.info("VoucherReminders completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
=end    
  end
end