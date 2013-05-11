module CreatePromotion
  include ActionView::Helpers::TextHelper
  @queue = :create_promotion
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/create_promotion.log")
  end

  def self.perform(id)
    now = Time.now
    logger.info("===================================================================")
    logger.info("Create Promotion started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    begin
      promotion = Promotion.get(id)
      push = Pushwoosh::RemoteApi.new
      count = Customer.count(:merchant => promotion.merchant)
      max = 500
      n = 1
      if count == max
        n = count/max
      elsif count > max
        n = count/max + 1
      end  
      message = "#{promotion.merchant.name} - #{promotion.message}".truncate(116, :separator => ' ')
      sms_message = "#{promotion.merchant.name} - #{promotion.message}".truncate(160, :separator => ' ')
      logger.info("Promotion(#{promotion.id}) requires #{n} iterations")
      for i in 0..n-1
        logger.info("Sending iteration #{i+1}")
        start = i*max
        customers = Customer.all(:fields => [:user_id], :merchant => promotion.merchant, :offset => start, :limit => max)
        user_list = []
        device_user_list = []
        customers.each do |customer|
          user_list << customer.user_id 
        end
        logger.info("Sending mobile notifications")
        if user_list.length > 0
          devices = UserDevice.all(:fields => [:device_id, :user_id], :user_id => user_list)
          device_list = []
          devices.each do |device|
            device_list << device.device_id
            device_user_list << device.user_id
          end
          if device_list.length > 0
            #logger.debug("Device list: #{device_list}")
            ret = push.create_message(promotion.merchant.id, message, promotion.start_date, device_list)
            logger.info("Response body: #{ret.response}")
            if ret.success?
              logger.info("Sending mobile notifications - complete for iteration #{i+1}")
            else  
              now = Time.now
              logger.info("Failed to complete iteration #{i+1}, Error Code(#{ret.response[:status_code]})")
            end
          else
            logger.info("No mobile notifications to send for iteration #{i+1}")
          end
        else
          logger.info("No mobile notifications to send for iteration #{i+1}")  
        end
        logger.info("Sending emails")
        email_user_list = user_list
        if email_user_list.length > 0
          email_users = User.all(:fields => [:id, :email], :id => email_user_list)
          subscriptions = Subscription.all(:fields => [:user_id, :email_notif], :user_id => email_user_list)
          user_id_to_subscription = []
          subscriptions.each do |subscription|
            user_id_to_subscription[subscription.user_id] = subscription
          end
          email_users.each do |user|
            if user.status != :pending
              if user_id_to_subscription[user.id]
                UserMailer.promotion_email(user, promotion).deliver if user_id_to_subscription[user.id].email_notif
              else
                Subscription.create(user)
                UserMailer.promotion_email(user, promotion).deliver
              end
            else              
              Resque.enqueue(SendSms, SmsProvider.get_current, SmsMessageType::MERCHANT_PROMOTION, user.id, sms_message, nil)    
            end
          end
          logger.info("Sending emails - complete for iteration #{i+1}")
        else
          logger.info("No emails to send for iteration #{i+1}")  
        end
      end
      begin  
        Promotion.transaction do
          promotion.status = :delivered
          promotion.save
        end
      rescue DataMapper::SaveFailureError => e
        now = Time.now
        logger.error("Exception: " + e.resource.errors.inspect)
        logger.info("Create Promotion failed to update status for Promotion(#{promotion.id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
        return
      end  
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Create Promotion failed for Promotion(#{promotion.id}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
      return  
    end      
    now = Time.now
    logger.info("Create Promotion completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end