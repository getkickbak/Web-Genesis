module ClinicVoucherPayments
  @queue = :clinic_voucher_payments
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/clinic_payments.log")
  end

  def self.perform(auto)
    now = Time.now
    logger.info("ClinicVoucherPayments started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    today = Time.new(now.year,now.mon,now.day)
    deal = Deal.first(:deal_id => "the-runners-shop-clinics")

    logger.info("Deal(#{deal.deal_id})")
    total_amount_due = Coupon.sum(:paid_amount, :deal_id => deal.id) || 0
    logger.info("Total Amount Due: #{total_amount_due}")
    coupons = Coupon.all(:deal_id => deal.id)
    coupon_ids = []
    refund_amount = 0
    coupons.each do |coupon|
      coupon_ids << coupon.coupon_id
      referral = Referral.first(Referral.creator.id => coupon.user.id)
      if referral
        referral_count = Coupon.count(Coupon.order.referral_id => referral.id, :new_customer => true) || 0
        if referral_count > 0
          subdeal = Subdeal.get(coupon.order.subdeal_id)
          refund_amount += subdeal.regular_price - subdeal.discount_price
          logger.info("User(#{coupon.user.name}) will be credited $#{refund_amount} for referring #{referral_count} new customers")
        end
      end
    end
    amount = Coupon.all(:coupon_id => coupon_ids).sum(:paid_amount) || 0
    #logger.debug("coupons: #{coupon_ids}")
    #logger.debug("amount: #{amount}")
    if amount > 0
      actual_amount = (amount * (100-APP_PROP["COMMISSION"])/100 - (coupon_ids.length * 0.3)) - refund_amount
      logger.info("Amount to be refunded: #{refund_amount}")
      logger.info("Amount to be transfered before commission: #{amount}")
      logger.info("Amount to be transfered after commission: #{actual_amount}")
    else
      logger.info("Merchant doesn't need to be paid")
    end
    logger.info("ClinicVoucherPayments completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end