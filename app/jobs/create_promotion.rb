module CreatePromotion
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
      logger.info("Promotion message requires #{n} iterations")
      for i in 0..n-1
        logger.info("Sending iteration #{i+1}")
        start = i*max
        customers = Customer.all(:fields => [:user_id], :merchant => promotion.merchant, :offset => start, :limit => max)
        user_list = []
        customers.each do |customer|
          user_list << customer.user_id 
        end
        devices = UserDevice.all(:fields => [:device_id, :user_id], :user_id => user_list)
        device_list = []
        device_user_list = []
        devices.each do |device|
          device_list << device.device_id
          device_user_list << device.user_id
        end
        #logger.debug("Device list: #{device_list}")
        logger.info("Sending mobile notifications")
        message = "#{promotion.merchant.name} - #{promotion.message}"
        ret = push.create_message(promotion.merchant.id, message, promotion.start_date, device_list)
        logger.info("Response body: #{ret.response}")
        if ret.success?
          logger.info("Completed iteration #{i+1}")
        else  
          now = Time.now
          logger.info("Failed to complete iteration #{i+1}")
          logger.info("Create Promotion failed to send message for Promotion(#{promotion.id}), Error Code(#{ret.response[:status_code]}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
        end
        logger.info("Sending mobile notifications - complete")
        logger.info("Sending emails")
        email_user_list = user_list - device_list
        email_users = User.all(:fields => [:name], :id => email_user_list)
        email_users.each do |user|
          UserMailer.promotion_email(user, promotion).deliver
        end
        logger.inf("Sending emails - complete")
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