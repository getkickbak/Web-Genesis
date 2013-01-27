class MerchantsController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource
  
  def show
    @merchant = Merchant.get(params[:id]) || not_found
    authorize! :read, @merchant
    
    @customer = Customer.first(:user => current_user, :merchant => @merchant) || not_found
    @customer_rewards = CustomerReward.all(:merchant => @merchant)

    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @merchants }
    end
  end
end