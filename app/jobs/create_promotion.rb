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
      customer_segment_visit_range = CustomerSegmentVisitRange.values[promotion.merchant.visit_frequency.value][promotion.customer_segment.value]
      customer_segment = promotion.customer_segment.value
      case customer_segment
      when "all"
        count = Customer.count(:merchant => promotion.merchant)
      when "newly_joined"
        count = Customer.count(:merchant => promotion.merchant, :created_ts.gt => 5.day.ago.to_time)
      when "very_frequent"
        count = DataMapper.repository(:default).adapter.select(
          "SELECT COUNT(*) WHERE
            SELECT user_id, COUNT(*) FROM earn_reward_records WHERE merchant_id = ? 
              AND created_ts > ? AND deleted_ts IS NULL
              GROUP BY user_id
              HAVING visit_count >= ?", promotion.merchant.id, customer_segment_visit_range[:period_in_months].month.ago.to_time, customer_segment_visit_range[:low]
        )
      when "somewhat_frequent", "not_frequent"
        count = DataMapper.repository(:default).adapter.select(
          "SELECT COUNT(*) WHERE
            SELECT user_id, COUNT(*) FROM earn_reward_records WHERE merchant_id = ? 
              AND created_ts > ? AND deleted_ts IS NULL
              GROUP BY user_id
              HAVING visit_count >= ? AND visit_count < ?", promotion.merchant.id, customer_segment_visit_range[:period_in_months].month.ago.to_time, customer_segment_visit_range[:low], customer_segment_visit_range[:high]
        )
      when "top_5_percent"
        count = (Customer.count(:merchant => promotion.merchant) * 0.05).to_i
      when "top_10_percent"
        count = (Customer.count(:merchant => promotion.merchant) * 0.10).to_i
      when "top_15_percent"
        count = (Customer.count(:merchant => promotion.merchant) * 0.15).to_i
      when "top_20_percent"
        count = (Customer.count(:merchant => promotion.merchant) * 0.20).to_i
      when "top_25_percent"
        count = (Customer.count(:merchant => promotion.merchant) * 0.25).to_i
      when "last_visited_10_days"
        EarnRewardRecord.count(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 10.day.ago.to_time, :offset => start, :limit => max)
      when "last_visited_20_days"
        EarnRewardRecord.count(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 20.day.ago.to_time, :offset => start, :limit => max)
      when "last_visited_30_days"
        EarnRewardRecord.count(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 30.day.ago.to_time, :offset => start, :limit => max)
      when "last_visited_60_days"
        EarnRewardRecord.count(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 60.day.ago.to_time, :offset => start, :limit => max)
      when "last_visited_90_days"
        EarnRewardRecord.count(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 90.day.ago.to_time, :offset => start, :limit => max)
      end  
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
        case customer_segment
        when "all"
          customers = Customer.all(:fields => [:user_id], :merchant => promotion.merchant, :offset => start, :limit => max)
        when "newly_joined"
          customers = Customer.all(:fields => [:user_id], :merchant => promotion.merchant, :created_ts.gt => 5.day.ago.to_time, :offset => start, :limit => max)
        when "very_frequent"
          customers = DataMapper.repository(:default).adapter.select(
            "SELECT user_id, COUNT(*) FROM earn_reward_records WHERE merchant_id = ? 
              AND created_ts > ? AND deleted_ts IS NULL
              GROUP BY user_id
              HAVING visit_count >= ?
              LIMIT ?,?", promotion.merchant.id, 3.month.ago.to_time, customer_segment_visit_range[:low], start, max
          )
        when "somewhat_frequent"
          customers = DataMapper.repository(:default).adapter.select(
            "SELECT user_id, COUNT(*) AS visit_count FROM earn_reward_records WHERE merchant_id = ? 
              AND created_ts > ? AND deleted_ts IS NULL
              GROUP BY user_id
              HAVING visit_count >= ? AND visit_count < ?
              LIMIT ?,?", promotion.merchant.id, 3.month.ago.to_time, customer_segment_visit_range[:low], customer_segment_visit_range[:high], start, max
          )
        when "not_frequent"
          customers = DataMapper.repository(:default).adapter.select(
            "SELECT user_id, COUNT(*) AS visit_count FROM earn_reward_records WHERE merchant_id = ? 
              AND created_ts > ? AND deleted_ts IS NULL
              GROUP BY user_id
              HAVING visit_count >= ? AND visit_count < ?
              LIMIT ?,?", promotion.merchant.id, 3.month.ago.to_time, customer_segment_visit_range[:low], customer_segment_visit_range[:high], start, max
          )
        when "top_5_percent","top_10_percent","top_15_percent", "top_20_percent", "top_25_percent"
          customers = DataMapper.repository(:default).adapter.select(
            "SELECT user_id, SUM(amount) AS total_amount FROM earn_reward_records WHERE merchant_id = ? 
              AND deleted_ts IS NULL
              GROUP BY user_id
              ORDER BY total_amount
              DESC LIMIT ?,?", promotion.merchant.id, start, max
          )
        when "last_visited_10_days"
          customers = EarnRewardRecord.all(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 10.day.ago.to_time, :offset => start, :limit => max)
        when "last_visited_20_days"
          customers = EarnRewardRecord.all(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 20.day.ago.to_time, :offset => start, :limit => max)
        when "last_visited_30_days"
          customers = EarnRewardRecord.all(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 30.day.ago.to_time, :offset => start, :limit => max)
        when "last_visited_60_days"
          customers = EarnRewardRecord.all(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 60.day.ago.to_time, :offset => start, :limit => max)
        when "last_visited_90_days"
          customers = EarnRewardRecord.all(:fields => [:user_id], :merchant => promotion.merchant, :unique => true, :created_ts.gt => 90.day.ago.to_time, :offset => start, :limit => max)
        end
        user_list = []
        device_user_list = []
        customers.each do |customer|
          user_list << customer.user_id 
          if customer_segment != "all"
            begin
              customer.promotions << promotion
              customer.save
            rescue DataMapper::SaveFailureError => e
              logger.error("Exception: " + e.resource.errors.inspect)
              logger.info("Failed to link Promotion(#{promotion.id}) to Customer(#{customer.id}), User{#{customer.user_id}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")}")
            end
          end   
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
            elsif !user.phone.empty?    
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