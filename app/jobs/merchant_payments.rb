module MerchantPayments
  @queue = :merchant_payments
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/merchant_payments.log")
  end

  def self.perform(auto)
    now = Time.now
    logger.info("Merchant Payments started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    merchants = Merchant.all
    merchants.each do |merchant|
      logger.info("Begin billing Merchant(#{merchant.name} at #{now.strftime("%a %m/%d/%y %H:%M %Z")})")
      beginning_of_month = 1.month.ago.beginning_of_month
      end_of_month = 1.month.ago.end_of_month
      trans_amount = EarnRewardRecord.sum(:amount, EarnRewardRecord.merchant.id => merchant.id, :challenge_id => 0, :created_ts.gte => beginning_of_month, :created_ts.lte => end_of_month)
      trans_fee = TransactionRecord.sum(:fee, :type => :earn, :created_ts.gte => beginning_of_month, :created_ts.lte => end_of_month)
      amount = APP_PROP["MONTHLY_FEE"] + trans_fees
      result = BILLING_GATEWAY.purchase(amount, merchant.id)
      if result.success?
        logger.info("Successfully billed Merchant(#{merchant.name}, Amount(#{amount}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")})")
        invoice_info = {
          :amount => amount,
          :trans_amount => trans_amount,
          :transactions => transactions,
          :monthly_fee => APP_PROP["MONTHLY_FEE"],
          :trans_fee => trans_fee,
          :start_date => beginning_of_month,
          :end_date => end_of_month
        }
        invoice = Invoice.create(merchant, invoice_info)
        MerchantMailer.invoice_email(invoice).deliver
      else
        logger.info("Failed to bill Merchant(#{merchant.name}, Amount(#{amount}) at #{now.strftime("%a %m/%d/%y %H:%M %Z")})")
      end  
    end
    now = Time.now
    logger.info("Merchant Payments completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end