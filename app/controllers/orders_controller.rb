require 'profile'
require 'caller'



class OrdersController < ApplicationController
  before_filter :authenticate_user!, :except => [:confirmed_email]

  #load_and_authorize_resource
  @@clientDetails=PayPalSDKProfiles::Profile.client_details
  def index
    authorize! :manage, :all

    user_id = params[:user_id]
    start = 0
    max = 10
    @user = User.get(user_id)
    @orders = Order.find(user_id, start, max)

    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @orders }
    end
  end

  def show
    #@user = User.get(params[:user_id])
    @order = Order.first(:order_id => params[:id]) || not_found
    authorize! :read, @order

    respond_to do |format|
      format.html # show.html.erb
    #format.xml  { render :xml => @order }
    end
  end

  def new
    @order = Order.new(flash[:order])
    authorize! :create, @order

    if @order.subdeal_id != 0
    subdeal = Subdeal.get(@order.subdeal_id)
    @order.total_payment = @order.quantity * subdeal.discount_price
    end
    if flash[:errors].nil?
    reset_order
    end
    @deal = Deal.first(:deal_id => params[:id]) || not_found
    if (params[:referral_id])
    @referral = Referral.first(:referral_id => params[:referral_id], :confirmed => true)
    else
    @referral = Referral.first(:deal_id => @deal.id, :creator_id => current_user.id, :confirmed => true)
    end

    if @referral.nil?
      respond_to do |format|
        format.html { redirect_to deal_path(@deal) }
      #format.xml  { render :xml => @order }
      end
    else
      session[:referral_id] = @referral.referral_id
      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @order }
      end
    end
  end

  def create
    @deal = Deal.first(:deal_id => params[:id]) || not_found
    authorize! :create, Order

    referral_id = session[:referral_id]
    if referral_id.nil?
    raise Exceptions::AppException.new("Referral needed before you can buy deal.")
    else
    referral_key_id = Referral.first(:referral_id => referral_id).id
    end

    new_customer = true
    referral = Referral.first(:deal_id => @deal.id, :confirmed => true, :creator_id => current_user.id)
    if referral
    referral_key_id = referral.id
    new_customer = false
    end

    if @deal.deal_id == "the-runners-shop-clinics"
      customer_ids = DataMapper.repository(:default).adapter.select(
        "SELECT id FROM runners_shop_customers WHERE LOWER(name) = ?", 
        current_user.name.downcase
      )
      if customer_ids.length > 0
        new_customer = false
      end
    end
    Order.transaction do
      begin
        @subdeal = Subdeal.get(params[:order][:subdeal_id])
        session[:order_in_progress] = true
        @order = Order.create(@deal, @subdeal, current_user, referral_key_id, new_customer, params[:order], params[:agree_to_terms])
        pay_transfer(@order)
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:order] = params[:order]
        flash[:give_gift] = params[:order][:give_gift].to_bool
        flash[:agree_to_terms] = params[:agree_to_terms]
        flash[:errors] = JSON.parse(e.resource.errors.to_json)
        respond_to do |format|
          format.html { redirect_to confirm_order_path(@deal)+"?referral_id=#{referral_id}" }
        #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
        #format.json { render :json => { :success => false } }
        end
      end
    end
  end

  def pay_details
    @order = Order.first(:order_id => session[:order_id])
    if !@order || @order.order_id != params[:order_id]
    raise Exception.new
    end

    authorize! :create, @order

    #logger.debug("Before Payment Confirmed")
    Order.transaction do
      begin
        @order[:payment_confirmed] = true
        @order.save
      rescue StandardError
        logger.error("Failed to update payment_confirmed for Order(#{@order.order_id})")
      ensure
        #logger.debug("After Payment Confiremd")

        #logger.debug("Before Print Coupons")
        @order.print_coupons
        #logger.debug("After Print Coupons")
        #logger.debug("Before Order Confirmed Email")
        if @order.gift_option.nil?
          UserMailer.order_confirmed_email(@order,false).deliver
        else
          UserMailer.order_confirmed_email(@order,true).deliver
        end
        #logger.debug("After Order Confirmed Email")

        #logger.debug("Before PayPal Payment Details")
        @response = session[:pay_response]
        @paykey = @response["payKey"]
        @caller =  PayPalSDKCallers::Caller.new(false, PayPalSDKProfiles::Profile::ADAPTIVE_SERVICE_PAYMENT_DETAILS)
        #sending the request string to call method where the paymentDetails API call is made
        @transaction = @caller.call(
        {
          "requestEnvelope.errorLanguage" => "en_US",
          "payKey" =>@paykey
        }
        )
        #logger.debug("After PayPal Payment Details")
        if !@transaction.success?
          logger.error("Failed to send PayPal Payment Details for Order(#{@order.order_id})")
        end
        respond_to do |format|
          #format.html { redirect_to user_order_path(@user, @order, :notice => 'Order was successfully created.') }
            format.html { redirect_to pay_thanks_path(@order.deal) }
          #format.xml  { render :xml => @order, :status => :created, :location => @order }
          #format.json { render :json => { :success => true, :data => @order, :total => 1 } }
        end   
      end
    end
  end

  def thanks
    @order = Order.first(:order_id => session[:order_id])
    if !@order
    raise Exception.new
    end
    @referral_id = session[:referral_id]
    reset_order
  end

  def cancel
    @order = Order.first(:order_id => session[:order_id])
    if !@order
    raise Exception.new
    end

    authorize! :destroy, @order

    referral_id = session[:referral_id]
    reset_order
    deal = Deal.get(@order.deal.id)

    Deal.transaction do
      begin
        deal[:limit_count] -= @order.quantity
        deal.save
      rescue StandardError
        logger.error("Failed to update limit count for Deal(#{deal.deal_id})")
      end
    end

    respond_to do |format|
    #format.html { redirect_to user_order_path(@user, @order, :notice => 'Order was successfully created.') }
      format.html { redirect_to deal_path(deal)+"?referral_id=#{referral_id}", :notice => 'Your order has been cancelled.' }
    #format.xml  { render :xml => @order, :status => :created, :location => @order }
    #format.json { render :json => { :success => true, :data => @order, :total => 1 } }
    end
  end

  def resend_coupons
    begin
      orders = Order.all(Order.user.id => current_user.id)
      orders.each do |order|
        UserMailer.order_confirmed_email(order).deliver
      end
      msg = []
      if orders.length > 0
        msg = ["Your Vouchers have been Sent!", "An email will arrive in your inbox shortly."]
      else
        msg = ["You have no Vouchers!", "Clearly, you need to buy one :)"]
      end
      respond_to do |format|
        format.json { render :json => { :success => true, :msg => msg, :total => orders.length } }
      end
    rescue StandardError => e
      logger.error(e)
      respond_to do |format|
        format.json { render :json => { :success => false, :msg => ["Your Vouchers failed to Send!", "Please try again."] } }
      end
    end
  end

  def destroy
    @order = Order.first(:order_id => params[:id]) || not_found
    authorize! :destroy, @order

    @order.destroy

    respond_to do |format|
      format.html { redirect_to(orders_url) }
    #format.xml  { head :ok }
    end
  end

  def confirmed_email
    authorize! :manage, :all
    @order = Order.first(:order_id => params[:id])
    @subdeal = Subdeal.get(@order.subdeal_id)

    respond_to do |format|
      format.html { render :template => "user_mailer/order_confirmed_email", :locals => { :order => @order } }
    #format.xml  { render :xml => @order }
    end
  end

  def confirmed_email_template
    authorize! :manage, :all
    @order = Order.first(:order_id => params[:id])

    respond_to do |format|
      format.html { render :template => "user_mailer/order_confirmed_email_template", :locals => { :order => @order } }
    #format.xml  { render :xml => @order }
    end
  end
  
  private

  def reset_order
    reset_session
  end

  def pay_transfer(order)
    @cancelURL=cancel_order_url(order.deal)
    @returnURL=pay_details_url(order.deal)+"?order_id=#{order.order_id}"
    @caller =  PayPalSDKCallers::Caller.new(false, PayPalSDKProfiles::Profile::ADAPTIVE_SERVICE_PAY)
    req={
      "requestEnvelope.errorLanguage" => "en_US",
      "clientDetails.ipAddress"=> @@clientDetails["ipAddress"],
      "clientDetails.deviceId" => @@clientDetails["deviceId"],
      "clientDetails.applicationId" => @@clientDetails["applicationId"],
      "memo"=> order.order_id,
      "feesPayer"=> APP_PROP["FEES_PAYER"],
      "receiverList.receiver[0].email"=> APP_PROP["PAYPAL_ACCOUNT"],
      "receiverList.receiver[0].amount"=> order[:total_payment],
      "currencyCode"=> "CAD",
      "actionType"=> "PAY",
      "returnUrl" => @returnURL,
      "cancelUrl"=> @cancelURL
    }
    @transaction = @caller.call(req)

    if (@transaction.success?)
      session[:order_id] = order.order_id
      session[:pay_response]=@transaction.response
      @response = session[:pay_response]
      @paykey = @response["payKey"].join
      @paymentExecStatus=@response["paymentExecStatus"].join
      #if "paymentExecStatus" is completed redirect to pay_details method else redirect to sandbox with paykey
      if (@paymentExecStatus =="COMPLETED")
      redirect_to :controller => 'orders',:action => 'pay_details'
      else
      redirect_to "#{PayPalSDKProfiles::Profile.PAYPAL_REDIRECT_URL}#{@paykey}"
      end
    else
    session[:paypal_error]=@transaction.response
    raise Exceptions::AppException.new("Payment Error.  Please Try Again.")
    end
  end
end
