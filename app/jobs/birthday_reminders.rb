module BirthdayReminders
  @queue = :birthday_reminders
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/birthday_reminders.log")
  end

  def self.perform
    now = Time.now
    logger.info("Birthday Reminders started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    begin
      count = User.count(:status => :active, User.profile.birthday => 7.day.from_now)
      max = 500
      n = 1
      if count == max
        n = count/max
      elsif count > max
        n = count/max + 1
      end
      logger.info("Birthday Reminders requires #{n} iterations")
      for i in 0..n-1
        logger.info("Sending iteration #{i+1}")
        start = i*max
        users = User.all(:status => :active, User.profile.birthday => 7.day.from_now, :offset => start, :limit => max)
        users = User.all
        users.each do |user|
          customers = Customer.all(:fields => [:merchant_id], :user => user, :status => :active, :order => [:update_ts.desc])
          if customers.length > 0
            merchant_ids = []
            customers.each do |customer|
              merchant_ids << customer.merchant_id
            end
            merchants = Merchant.all(:id => merchant_ids)
            UserMailer.birthday_reminder_email(merchants, user).deliver
          end
        end
      end
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Birthday Reminders failed at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
      return  
    end
    now = Time.now
    logger.info("Birthday Reminders completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end