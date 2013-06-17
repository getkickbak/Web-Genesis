module AccountBalanceSummaries
  @queue = :account_balance_summaries
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/account_balance_summaries.log")
  end

  def self.perform()
    now = Time.now
    logger.info("Account Balance Summaries started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    begin
      count = User.count(:status => :active)
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
        users = User.all(:status => :active, :offset => start, :limit => max)
        users.each do |user|
          customers = Customer.all(:user => user)
          UserMailer.account_balance_summary_email(customers, user).deliver
        end
      end
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Account Balance Summaries failed at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
      return  
    end
    now = Time.now
    logger.info("Account Balance Summaries completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end