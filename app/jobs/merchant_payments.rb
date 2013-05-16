module MerchantPayments
  @queue = :merchant_payments
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/merchant_payments.log")
  end

  def self.perform()
    logger.info("Merchant Payments started at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")}")
    begin
      merchants = Merchant.all(:status => :active, :role => "merchant")
      device_payment_plan = DevicePaymentPlan.first
      merchants.each do |merchant|
        next if merchant.payment_account_id.empty?
        next if merchant.payment_subscription.nil?
        logger.info("Billing Merchant(#{merchant.id}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
        beginning_of_previous_month = 1.month.ago.beginning_of_month.to_date
        end_of_previous_month = 1.month.ago.end_of_month.to_date
        subscription = merchant.payment_subscription
        if beginning_of_previous_month > subscription.end_date
          logger.info("Subscription already ended for Merchant(#{merchant.id})")
          next
        end
        if end_of_previous_month <= subscription.paid_through_date
          logger.info("Subscription is already paid for Merchant(#{merchant.id}) up to billing cycle #{beginning_of_previous_month.strftime("%b %d, %Y")}")
          next
        end
        invoice = Invoice.first(:merchant => merchant, :start_date => beginning_of_previous_month)
        if invoice
          logger.info("Invoice already generated for Merchant(#{merchant.id}) up to billing cycle #{beginning_of_previous_month.strftime("%b %d, %Y")})")
          next
        end
        first_month = (subscription.start_date.mon == beginning_of_previous_month.mon)
        customer_count = Customer.count(:merchant => merchant, :created_ts.lte => end_of_previous_month.to_time)
        avg_customer_count = customer_count / merchant.venues.length
        payment_plan = PaymentPlan.first(:avg_member_count.gt => avg_customer_count, :order => [:avg_member_count.asc])
        amount = 0.00
        plan_fees = 0.00
        device_fees = 0.00
        merchant.venues.each do |venue|
          plan_fees += (venue.device_type == :wifi) ? payment_plan.price_wifi : payment_plan.price_internet
          device_fees -= (venue.device_type == :wifi) ? device_payment_plan.price_wifi : device_payment_plan.price_internet
        end
        devices = Device.all(:merchant => merchant, :status => :activated)
        devices.each do |device|
          device_fees += (device.type == :wifi) ? device_payment_plan.price_wifi : device_payment_plan.price_internet
        end
        amount += (plan_fees + device_fees)
        amount -= (amount * subscription.discount_rate / 100)
        proration = 0.00
        if first_month && (subscription.start_date.day != 1)
          proration = -(amount / Time.days_in_month(beginning_of_previous_month.mon, beginning_of_previous_month.year) * (subscription.start_date.day - 1))
        end
        if subscription.end_date < end_of_previous_month
          proration = -(amount / Time.days_in_month(beginning_of_previous_month.mon, beginning_of_previous_month.year) * (end_of_previous_month.day - subscription.end_date.day))
        end
        charges = amount + proration
        tax = 0.13 * charges
        total_amount = charges + tax + subscription.balance
        begin
          Invoice.transaction do
            invoice_info = {
              :balance => subscription.balance,
              :charges => amount,
              :proration => proration,
              :tax => tax,
              :amount => total_amount,
              :start_date => beginning_of_previous_month,
              :end_date => end_of_previous_month,
              :items_attributes => [
                { :description => payment_plan.name, :quantity => merchant.venues.length, :price => 0.00, :amount => plan_fees },
                { :description => device_payment_plan.name, :quantity => devices.length, :price => 0.00, :amount => device_fees }
              ]
            }
            invoice = Invoice.create(merchant, invoice_info)
          end
        rescue DataMapper::SaveFailureError => e
          now = Time.now
          logger.error("Exception: " + e.resource.errors.inspect)
          logger.info("Failed to generate invoice for Merchant(#{merchant.id}), Amount(#{total_amount}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
          next
        rescue StandardError => e
          now = Time.now
          logger.error("Exception: " + e.resource.message)
          logger.info("Failed to generate invoice for Merchant(#{merchant.id}), Amount(#{total_amount}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
          next
        end
=begin
result = Braintree::Transaction.sale(
:amount => total_amount,
:customer_id => merchant.payment_account_id,
:payment_method_token => "the_payment_method_token",
:options => {
:submit_for_settlement => true
}
)
=end
        paid = false
        begin
          result = Stripe::Charge.create(
            :amount => (total_amount*100).to_i,
            :currency => "cad",
            :customer => merchant.payment_account_id,
            :description => ""
          )
          paid = true
        rescue Stripe::CardError => e
        # Since it's a decline, Stripe::CardError will be caught
          logger.info("Error: #{e.json_body[:error][:message]}")
        rescue Stripe::InvalidRequestError => e
        # Invalid parameters were supplied to Stripe's API
          logger.info("Error: #{e.json_body[:error][:message]}")
        rescue Stripe::AuthenticationError => e
        # Authentication with Stripe's API failed
        # (maybe you changed API keys recently)
          logger.info("Error: #{e.json_body[:error][:message]}")
        rescue Stripe::APIConnectionError => e
        # Network communication with Stripe failed
          logger.info("Error: #{e.json_body[:error][:message]}")
        rescue Stripe::StripeError => e
        # Display a very generic error to the user, and maybe send
        # yourself an email
          logger.info("Error: #{e.json_body[:error][:message]}")
        rescue StandardError => e
        # Something else happened, completely unrelated to Stripe
          logger.info("Error: #{e.message}")
        end

        begin
          MerchantPaymentSubscription.transaction do
            if paid
              logger.info("Successfully billed Merchant(#{merchant.id}), Amount(#{total_amount}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
              invoice.paid = true
              invoice.update_ts = Time.now
              invoice.save
              subscription.update(
                :plan_id => payment_plan.id,
                :balance => 0.00,
                :paid_through_date => end_of_previous_month
              )
            else
              logger.info("Failed to bill Merchant(#{merchant.id}), Amount(#{total_amount}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
              subscription.update(
                :plan_id => payment_plan.id,
                :balance => total_amount
              )
            end
          end
        rescue DataMapper::SaveFailureError => e
          now = Time.now
          logger.error("Exception: " + e.resource.errors.inspect)
          logger.info("Failed to update subscription for Merchant(#{merchant.id}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
        rescue StandardError => e
          now = Time.now
          logger.error("Exception: " + e.resource.message)
          logger.info("Failed to update subscription for Merchant(#{merchant.id}) at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")})")
        end
        Business::MerchantMailer.invoice_email(invoice).deliver
      end
    rescue StandardError => e
      now = Time.now
      logger.error("Exception: " + e.message)
      logger.info("Merchant Payments failed at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
      return
    end
    logger.info("Merchant Payments completed successfully at #{Time.now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end