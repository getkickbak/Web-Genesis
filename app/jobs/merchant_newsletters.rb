module MerchantNewsletters
  @queue = :merchant_newsletters
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/merchant_newsletters.log")
  end

  def self.perform(auto)
    now = Time.now
    logger.info("MerchantNewsletters started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    logger.info("MerchantNewsletters completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end