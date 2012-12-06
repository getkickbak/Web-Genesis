class DashboardController < ApplicationController
  before_filter :authenticate_user!
  skip_authorization_check
  
  def index
    customers_info = Customer.all(:fields => [:id, :merchant_id], :user_id => current_user.id, :status => :active, :order => [:update_ts.desc])
    merchant_ids = []
    merchant_id_to_customer_id = {}
    customers_info.each do |customer_info|
      merchant_ids << customer_info.merchant_id
      merchant_id_to_customer_id[customer_info.merchant_id] = customer_info.id
    end
    merchants = Merchant.all(:id => merchant_ids)
    customer_id_to_merchant = {}
    merchants.each do |merchant|
      customer_id_to_merchant[merchant_id_to_customer_id[merchant.id]] = merchant
    end
    @customers = Customer.all(:user_id => current_user.id, :status => :active, :order => [:update_ts.desc]).paginate(:page => params[:page])
    @customers.each do |customer|
      customer.eager_load_merchant = customer_id_to_merchant[customer.id]
    end
    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @users }
    end
  end
  
  def activate_tag
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        @user.activate_tag
        format.html { redirect_to({:action => "index"}, {:notice => t("users.activate_tag_success")}) }
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:error] = t("users.activate_tag_failure")
        respond_to do |format|
          format.html { render :action => "index" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
  end 
end