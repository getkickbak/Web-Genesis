module CreatePromotion
  @queue = :create_promotion
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/create_promotion.log")
  end

  def self.perform(id)
    now = Time.now
    logger.info("Create Promotion started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    promotion = Promotion.get(id)
    push = Pushwoosh::RemoteApi.new
    count = Customer.count(Customer.merchant.id => promotion.merchant.id)
    max = 1000
    n = 1
    if count == max
      n = count/max
    elsif count > max
      n = count/max + 1
    end  
    for i in 0..n-1
      start = i*max
      customers = Customer.all(Customer.merchant.id => promotion.merchant.id, :offset => start, :limit => max)
      user_list = []
      customers.each do |customer|
        user_list << customer.user.id 
      end
      devices = UserDevice.all(UserDevice.user.id => user_list)
      device_list = []
      devices.each do |device|
        device_list << device.id
      end
      push.create_message(promotion.message, promotion.start_date, device_list)
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
    now = Time.now
    logger.info("Create Promotion completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end