module VoucherPaymentsCapture
  @queue = :voucher_payments_capture
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/payments_capture.log")
  end

  def self.perform(auto)
    now = Time.now
    logger.info("VoucherPaymentsCapture started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    deals = Deal.all(:conditions => ["limit_count >= min_limit"] , :offset => 0, :limit => 100)
    deals.each do |deal|
      #logger.debug("begin")
      #logger.debug("Deal(#{deal.deal_id})")
      orders = Order.all(Order.deal.id => deal.id, :payment_confirmed => false)
      orders.each do |order|
        result = Braintree::Transaction.submit_for_settlement(order.txn_id)
        if result.success?
          Order.transaction do
            begin
              order[:payment_confirmed] = true
              order.save
              #@response.sort{|a,b| a[1]<=>b[1]}.each { |elem|
              #  logger.debug "#{elem[1]}, #{elem[0]}"
              #}
              #logger.debug("Before Print Coupons")
              order.print_coupons
              #logger.debug("After Print Coupons")
              #logger.debug("Before Order Confirmed Email")
              UserMailer.order_confirmed_email(order,order.gift_option.nil?).deliver
            rescue DataMapper::SaveFailureError => e
              logger.error("Failed to update payment_confirmed for Order(#{order.order_id})")
              logger.error("Exception: " + e.resource.errors.inspect)
            rescue StandardError => e
              logger.error("Failed to update payment_confirmed for Order(#{order.order_id})")
              logger.error("Exception: " + e.inspect)  
            end
          end
        else
          logger.error("Failed to submit settlement for Order(#{order.order_id})")
          logger.error("Transaction Status: " + result.transaction.status)
          logger.error("Transaction Processor Response Code: " + result.transaction.processor_response_code)
          logger.error("Transaction Processor Response Text: " + result.transaction.processor_response_text)
        end
      end
      #logger.debug("end")
    end
    logger.info("VoucherPaymentsCapture completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end