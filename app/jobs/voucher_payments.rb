module VoucherPayments
  @queue = :voucher_payments
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/payments.log")
  end

  def self.perform(auto)
=begin    
    week_um = Date.today.cweek
    if auto && (week_num % 2 == 1)
      return
    end
    now = Time.now
    logger.info("VoucherPayments started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    today = Time.new(now.year,now.mon,now.day)
    day_in_sec = 24 * 60 * 60
    deals = Deal.all(:expiry_date.gte => today - (21 * day_in_sec))
    deals.each do |deal|
      #logger.debug("begin")
      logger.info("Deal(#{deal.deal_id})")
      total_amount_due = Coupon.sum(:paid_amount, :deal_id => deal.id , :redeemed => true) || 0
      total_amount_paid = Coupon.sum(:paid_amount, :deal_id => deal.id , :redeemed => true, :paid_merchant => true) || 0
      logger.info("Total Amount Due: #{total_amount_due}")
      logger.info("Total Amount Paid: #{total_amount_paid}")
      coupons = Coupon.all(:fields => [:coupon_id], :deal_id => deal.id , :redeemed => true, :paid_merchant => false)
      coupon_ids = []
      coupons.each do |coupon|
        coupon_ids << coupon.coupon_id
      end
      amount = Coupon.all(:coupon_id => coupon_ids).sum(:paid_amount) || 0
      #logger.debug("coupons: #{coupon_ids}")
      #logger.debug("amount before: #{amount}")
      if amount + total_amount_paid > total_amount_due
        logger.error("Calculated amount (#{amount}) exceeds remaining amount (#{total_amount_due - total_amount_paid}) for Deal(#{deal.deal_id})")
        amount = total_amount_due - total_amount_paid
      end
      #logger.debug("amount after: #{amount}")
      if amount > 0
        actual_amount = amount * (100-APP_PROP["COMMISSION"])/100 - (coupon_ids.length * 0.3)
        Coupon.transaction do
          begin
            Coupon.all(:coupon_id => coupon_ids).update!(:paid_merchant => true, :update_ts => now)
            logger.info("Amount to be transfered before commission: #{amount}")
            logger.info("Amount to be transfered after commission: #{actual_amount}")
          rescue DataMapper::SaveFailureError => e
            logger.error("Failed to update paid_merchant for Coupons(#{coupon_ids.join(",")})")
            logger.error("Exception: " + e.resource.errors.inspect)
          end
        end
      else
        logger.info("Merchant doesn't need to be paid")  
      end
      #logger.debug("end")
    end
    logger.info("VoucherPayments completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
=end    
  end
end