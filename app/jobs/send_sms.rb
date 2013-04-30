module SendSms
  @queue = :send_sms
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/send_sms.log")
  end

  def self.perform(sms_message_type, user_id, message, options)
    begin
      now = Time.now
      p = Plivo::RestAPI.new(APP_PROP["PLIVO_AUTH_ID"], APP_PROP["PLIVO_AUTH_TOKEN"])
      user = User.get(user_id)
      opts = JSON.parse(options, { :symbolize_names => true })
      texts = []
      if sms_message_type == SmsMessageType::REGISTRATION
        texts << I18n.t("sms.registration_1") % [opts[:name], opts[:points], opts[:prize_points]]
        texts << I18n.t("sms.registration_2")
      elsif sms_message_type == SmsMessageType::REGISTRATION_REMINDER
        texts << I18n.t("sms.registration_reminder_1") % [opts[:name], opts[:points], opts[:prize_points]]
        texts << I18n.t("sms.registration_reminder_2")
      elsif sms_message_type == SmsMessageType::REGISTRATION_REMINDER_REWARD
        texts << I18n.t("sms.registration_reminder_reward_1") % [opts[:name], opts[:reward_name]]
        texts << I18n.t("sms.registration_reminder_reward_2")
      elsif sms_message_type == SmsMessageType::MERCHANT_PROMOTION
        texts << I18n.t("sms.merchant_promotion_1") % [message]    
        texts << I18n.t("sms.merchant_promotion_2")
      end
      # Send SMS
      texts.each do |text|
        params = {
          'src' => APP_PROP["PLIVO_NUMBER"],
          'dst' => "1#{user.phone}",
          'text' => text,
          'type' => 'sms',
        }
        response = p.send_message(params)
        if response[0].nil?
          logger.info("Send Sms Type(#{sms_message_type}) failed for User(#{user_id}), Response(#{response}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
          break
        end
      end
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Send Sms Type(#{sms_message_type}) failed for User(#{user_id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    end
  end
end