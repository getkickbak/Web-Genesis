class MerchantsController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource
  
  def show
    @merchant = Merchant.get(params[:id]) || not_found
    authorize! :read, @merchant
    
    @customer = Customer.first(:user => current_user, :merchant => @merchant) || not_found
    Common.populate_badge(@customer.badge, :iphone, :mxhdpi)
    @next_badge = Common.find_next_badge(@merchant.badges.to_a, @customer.badge)
    @customer_rewards = Common.get_rewards_by_merchant(@merchant)

    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @merchants }
    end
  end
end