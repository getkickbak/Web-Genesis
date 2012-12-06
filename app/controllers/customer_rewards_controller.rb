class CustomerRewardsController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource
  
  def index
    authorize! :read, CustomerReward

    merchant_ids = []
    customers = Customer.all(:fields => [:merchant_id], :user_id => current_user.id, :status => :active, :order => [ :created_ts.desc ])
    customers.each do |customer|
      merchant_ids << customer.merchant_id
    end
    @merchants = Merchant.all(:id => merchant_ids) 
    @merchant = Merchant.get(params[:merchant_id]) || @merchants.first
    @customer_rewards = CustomerReward.all(:merchant => @merchant)

    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @merchants }
    end
  end
end