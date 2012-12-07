class DashboardController < ApplicationController
  before_filter :authenticate_user!
  skip_authorization_check
  
  def index
    customers_info = Customer.all(:fields => [:id, :merchant_id], :user_id => current_user.id, :status => :active, :order => [:update_ts.desc])
    customer_ids = []
    merchant_ids = []
    merchant_id_to_customer_id = {}
    customers_info.each do |customer_info|
      customer_ids << customer_info.id
      merchant_ids << customer_info.merchant_id
      merchant_id_to_customer_id[customer_info.merchant_id] = customer_info.id
    end
    merchants = Merchant.all(:id => merchant_ids)
    customer_id_to_merchant = {}
    merchants.each do |merchant|
      customer_id_to_merchant[merchant_id_to_customer_id[merchant.id]] = merchant
    end
    customer_to_badges = CustomerToBadge.all(:fields => [:customer_id, :badge_id], :customer_id => customer_ids)
    badge_ids = []
    badge_id_to_customer_id = {}
    customer_to_badges.each do |customer_to_badge|
      badge_ids << customer_to_badge.badge_id
      badge_id_to_customer_id[customer_to_badge.badge_id] = customer_to_badge.customer_id
    end
    badges = Badge.all(:id => badge_ids)
    customer_id_to_badge = {}
    badges.each do |badge|
      customer_id_to_badge[badge_id_to_customer_id[badge.id]] = badge
    end    
    badge_id_to_type_id = {}
    badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
    badge_to_types.each do |badge_to_type|
      badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
    end
    @customers = Customer.all(:user_id => current_user.id, :status => :active, :order => [:update_ts.desc]).paginate(:page => params[:page])
    @customers.each do |customer|
      customer.eager_load_merchant = customer_id_to_merchant[customer.id]
      badge = customer_id_to_badge[customer.id]
      customer.eager_load_badge = badge
      customer.eager_load_badge.eager_load_type = BadgeType.id_to_type[badge_id_to_type_id[badge.id]]
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
        if @user.tag
          if @user.activate_tag
            format.html { redirect_to({:action => "index"}, {:notice => t("users.activate_tag_success")}) }
          else
            format.html { redirect_to({:action => "index"}, {:notice => t("users.activate_tag_already_activated")}) }
          end  
        else
          flash[:error] = t("users.activate_tag_not_registered")
          respond_to do |format|
            format.html { render :action => "index" }
            #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
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