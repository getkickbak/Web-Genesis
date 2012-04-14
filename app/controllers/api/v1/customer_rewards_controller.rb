class Api::V1::CustomerRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    @venue = Venue.get(params[:venue_id]) || not_found
    authorize! :read, CustomerReward
    
    @rewards = @venue.customer_rewards
    render :template => '/api/v1/customer_rewards/index'
  end
  
  def redeem
    @venue = Venue.first(:id => params[:venue_id], Venue.merchant.id => params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        reward = CustomerReward.first(:id => params[:id], CustomerReward.merchant.id => @venue.merchant.id)
        if @customer.points - reward.points >= 0
          record = RedeemRewardRecord.new(
            :reward_id => reward.id,
            :venue_id => @venue.id,
            :points => reward.points,
            :created_ts => Time.now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          @customer.points -= reward.points
          @customer.save
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => true, :metaData => { :account_points => @customer.points } } }
          end
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [t("api.customer_rewards.redeem_failure")] } }
          end  
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.customer_rewards.redeem_failure")] } }
        end
      end
    end
  end
end