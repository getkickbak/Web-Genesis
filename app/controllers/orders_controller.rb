require 'profile'
require 'caller'



class OrdersController < ApplicationController
  before_filter :authenticate_user!, :except => [:confirmed_email]

  #load_and_authorize_resource
  @@clientDetails=PayPalSDKProfiles::Profile.client_details
  def index
    authorize! :read, current_user

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
    reset_order
    @order = Order.new
    authorize! :create, @order

    @deal = Deal.first(:deal_id => params[:id]) || not_found
    if (params[:referral_id])
      @referral = Referral.first(:referral_id => params[:referral_id], :confirmed => true)
    else
      @referral = Referral.first(:deal_id => @deal.id, :creator_id => current_user.id, :confirmed => true)
    end
    
    if @referral.nil?
      raise Exceptions::AppException.new("Referral needed before you can buy deal.")
    end
    
    session[:referral_id] = @referral.referral_id

    respond_to do |format|
      format.html # new.html.erb
    #format.xml  { render :xml => @order }
    end
  end

  def create
    authorize! :create, Order

    referral_id = session[:referral_id]
    if referral_id.nil?
      raise Exceptions::AppException.new("Referral needed before you can buy deal.")
    end
    
    Order.transaction do
      begin
        @deal = Deal.first(:deal_id => params[:id]) || not_found
        @subdeal = Subdeal.get(params[:order][:subdeal_id])
        session[:order_in_progress] = true
        url = deal_path(@deal)+"?referral_id=#{referral_id}"
        @order = Order.create(@deal, @subdeal, current_user, referral_id, params[:order], url)
        pay_transfer(@order)
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @order = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
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

    begin
      @order[:payment_confirmed] = true
      @order.save
    rescue StandardError
      logger.error("Failed to update payment_confirmed for Order: " + @order.id)
    end

    @order.print_coupons
    UserMailer.order_confirmed_email(@order).deliver

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
    if (@transaction.success?)
      session[:paydetails_response]=@transaction.response
      respond_to do |format|
      #format.html { redirect_to user_order_path(@user, @order, :notice => 'Order was successfully created.') }
        format.html { redirect_to pay_thanks_path(@order.deal.deal_id) }
      #format.xml  { render :xml => @order, :status => :created, :location => @order }
      #format.json { render :json => { :success => true, :data => @order, :total => 1 } }
      end
    else
      session[:paypal_error]=@transaction.response
      redirect_to :controller => 'calls', :action => 'error'
    end
  end

  def thanks
    @order = Order.first(:order_id => session[:order_id])
    if !@order
      raise Exception.new
    end
    reset_order
  end

  def cancel
    @order = Order.first(:order_id => session[:order_id])
    if !@order
      raise Exception.new
    end

    authorize! :destroy, @order

    reset_order
    deal = Deal.get(@order.deal.id)

    begin
    deal[:limit_count] -= @order.quantity
      deal.save
    rescue StandardError
      logger.error("Failed to update limit count for Deal: " + deal.id)
    end

    respond_to do |format|
    #format.html { redirect_to user_order_path(@user, @order, :notice => 'Order was successfully created.') }
      format.html { redirect_to deal_path(deal)+"?referral_id=#{@order.referral_id}", :notice => 'Your order has been cancelled.' }
    #format.xml  { render :xml => @order, :status => :created, :location => @order }
    #format.json { render :json => { :success => true, :data => @order, :total => 1 } }
    end
  end

  def resend_coupons
    begin
      orders = Order.all(:user_id => current_user.id)
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
    @order = Order.first(:order_id => params[:id])
    authorize! :destroy, @order

    @order.destroy

    respond_to do |format|
      format.html { redirect_to(orders_url) }
    #format.xml  { head :ok }
    end
  end

  def confirmed_email
    @order = Order.first(:order_id => params[:id])
    @subdeal = Subdeal.get(@order.subdeal_id)

    respond_to do |format|
      format.html { render :template => "user_mailer/order_confirmed_email", :locals => { :order => @order } }
    #format.xml  { render :xml => @order }
    end
  end

  def confirmed_email_template
    @order = Order.first(:order_id => params[:id])

    respond_to do |format|
      format.html { render :template => "user_mailer/order_confirmed_email_template", :locals => { :order => @order } }
    #format.xml  { render :xml => @order }
    end
  end

  def coupon_template
    @coupon = Coupon.first(:coupon_id => params[:coupon_id])

    @order = @coupon.order
    @coupon_id = @coupon.coupon_id
    @coupon_title = @coupon.coupon_title
    @qr_code = @coupon.qr_code
    respond_to do |format|
      format.html { render :template => "user_mailer/coupon_template" }
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
      "receiverList.receiver[1].email"=> order.deal.merchant.paypal_account,
      "receiverList.receiver[0].amount"=> order[:total_payment],
      "receiverList.receiver[1].amount"=> order[:total_payment]*(100-APP_PROP["COMMISSION"])/100,
      "receiverList.receiver[0].primary[0]"=> true,
      "receiverList.receiver[1].primary[1]"=> false,
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
