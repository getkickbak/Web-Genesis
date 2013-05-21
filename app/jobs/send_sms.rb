module SendSms
  @queue = :send_sms
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/send_sms.log")
  end

  def self.perform(provider, sms_message_type, user_id, message, options)
    begin
      now = Time.now
      user = User.get(user_id)
      opts = JSON.parse(options, { :symbolize_names => true }) if options
      texts = []
      if sms_message_type == SmsMessageType::MERCHANT_REGISTRATION
        texts << I18n.t("sms.merchant_registration_1") % [opts[:name], opts[:points], opts[:prize_points]]
        texts << I18n.t("sms.merchant_registration_2")
      elsif sms_message_type == SmsMessageType::MERCHANT_REGISTRATION_REMINDER
        texts << I18n.t("sms.merchant_registration_reminder_1") % [opts[:name], opts[:points], opts[:prize_points]]
        texts << I18n.t("sms.merchant_registration_reminder_2")
      elsif sms_message_type == SmsMessageType::MERCHANT_REGISTRATION_REMINDER_REWARD
        texts << I18n.t("sms.merchant_registration_reminder_reward_1") % [opts[:name], opts[:reward_name]]
        texts << I18n.t("sms.merchant_registration_reminder_reward_2")
      elsif sms_message_type == SmsMessageType::MERCHANT_PROMOTION
        texts << I18n.t("sms.merchant_promotion_1") % [message]    
        texts << I18n.t("sms.merchant_promotion_2")
      elsif sms_message_type == SmsMessageType::REGISTRATION_REMINDER
        texts << I18n.t("sms.registration_reminder")
      end
      # Send SMS
      delivered = true
      if provider == SmsProvider::PLIVO
        p = Plivo::RestAPI.new(APP_PROP["PLIVO_AUTH_ID"], APP_PROP["PLIVO_AUTH_TOKEN"])
        texts.each do |text|
          params = {
            'src' => APP_PROP["PLIVO_NUMBER"],
            'dst' => "1#{user.phone}",
            'text' => text,
            'type' => 'sms',
          }
          response = p.send_message(params)
          if response[0].nil?
            delivered = false
            logger.info("Send Sms Type(#{sms_message_type}) failed for User(#{user_id}), Response(#{response}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
            break
          end
        end
      elsif provider == SmsProvider::TWILIO
        client = Twilio::REST::Client.new(APP_PROP["TWILIO_ACCOUNT_ID"], APP_PROP["TWILIO_AUTH_TOKEN"])
        account = client.account
        texts.each do |text|
          account.sms.messages.create(
            {
              :from => APP_PROP["TWILIO_NUMBER"], 
              :to => "1#{user.phone}", 
              :body => text
            }
          )
        end
      end
      if delivered && sms_message_type == SmsMessageType::REGISTRATION_REMINDER
        begin
          User.transaction do
            reminder = RegistrationReminder.first(:user_id => user.id, :count => user.registration_reminder_count)
            reminder.delivered = true
            reminder.save
            user.registration_reminder_count += 1
            user.save!
          end
        rescue DataMapper::SaveFailureError => e
          now = Time.now
          logger.error("Exception: " + e.resource.errors.inspect)
          logger.info("Registration Reminders failed to update info for User(#{user.id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
          return  
        end        
      end
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Send Sms Type(#{sms_message_type}) failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    end
  end
end