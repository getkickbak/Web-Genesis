module RegistrationReminders
  @queue = :registration_reminders
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/registration_reminders.log")
  end

  def self.perform()
    now = Time.now
    today = Date.today
    logger.info("Registration Reminders started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    begin
      three_months_ago = 3.month.ago.to_date.to_time
      count = User.count(:status => :pending, :created_ts.gt => three_months_ago)
      max = 500
      n = 1
      if count == max
        n = count/max
      elsif count > max
        n = count/max + 1
      end
      for i in 0..n-1
        logger.info("Sending iteration #{i+1}")
        start = i*max
        users = User.all(:fields => [:id, :created_ts], :status => :pending, :created_ts.gt => three_months_ago, :offset => start, :limit => max)
        users.each do |user|
          begin
            User.transaction do
              next if user.phone.empty?
              diff = today - user.created_ts.to_date
              backoff = (2**user.registration_reminder_count) * 2
              reminder = RegistrationReminder.first(:user_id => user.id, :count => user.registration_reminder_count)
              reminder = RegistrationReminder.create(
                { 
                  :user_id => user.id,
                  :count => user.registration_reminder_count
                }
              ) if reminder.nil?
              if diff >= backoff && !reminder.delivered
                Resque.enqueue(SendSms, SmsProvider.get_current, SmsMessageType::REGISTRATION_REMINDER, user.id, nil, nil)
              end
            end
          rescue DataMapper::SaveFailureError => e
            now = Time.now
            logger.error("Exception: " + e.resource.errors.inspect)
            logger.info("Registration Reminders failed to create reminder(#{user.registration_reminder_count}) for User(#{user.id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
          end
        end
      end
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Registration Reminders failed at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
      return  
    end
    now = Time.now
    logger.info("Registration Reminders completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end