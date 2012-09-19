class Api::V1::OrdersController < Api::V1::BaseApplicationController
  before_filter :authenticate_user!, :except => [:new, :create, :confirmed_email]

  #load_and_authorize_resource
  
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
    payment_info = {
      :amount => "100.00",
      :order_id => order.order_id,
    }
    if new_user
      token_info = {
        :customer_id => current_user.id
      }
      if new_credit_card
        credit_card = CreditCard.create(current_user)
        token_info[:credit_card] = {
          :token => "#{credit_card.id}",
          :cardholder_name => "The Cardholder",
          :number => "5105105105105100",
          :expiration_date => "05/2012",
          :cvv => "cvv",
          :billing_address => {
            :street_address => "1 E Main St",
            :locality => "Chicago",
            :region => "Illinois",
            :postal_code => "60622",
            :country_code_alpha2 => "US"
          }
        } 
      end
      payment_info = payment_info.merge(token_info)
    else   
      credit_card = CreditCard.create(current_user)
      billing_info = {
        :credit_card => {
          :token => "#{credit_card.id}",
          :cardholder_name => "The Cardholder",
          :number => "5105105105105100",
          :expiration_date => "05/2012",
          :cvv => "cvv",
          :billing_address => {
            :street_address => "1 E Main St",
            :locality => "Chicago",
            :region => "Illinois",
            :postal_code => "60622",
            :country_code_alpha2 => "US"
          }
        },
        :customer => {
          :id => current_user.id
        },
        :options => {
          :store_in_vault => true
        }
      }
      payment_info.merge(billing_info)
    end
    
    if order.deal.limit_count + order.quantity >= order.deal.min_limit
      options = payment_info[:options]
      if options.nil?
        payment_info[:options] = {
          :submit_for_settlement => true
        }
      else
        payment_info[:options][:submit_for_settlement] = true
      end  
    end
    result = Braintree::Transaction.sale(payment_info)

    if result.success?
      order[:txn_id] = result.transaction.id
      if order.deal.limit_count + order.quantity >= order.deal.min_limit
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
      else
        order.save  
      end
      session[:order_id] = order.order_id
      respond_to do |format|
        #format.html { redirect_to user_order_path(@user, @order, :notice => 'Order was successfully created.') }
          format.html { redirect_to pay_thanks_path(order.deal) }
        #format.xml  { render :xml => @order, :status => :created, :location => @order }
        #format.json { render :json => { :success => true, :data => @order, :total => 1 } }
      end
    else
      session[:paypal_error]=@transaction.response
      raise Exceptions::AppException.new("Payment Error.  Please Try Again.")
    end
  end
end
