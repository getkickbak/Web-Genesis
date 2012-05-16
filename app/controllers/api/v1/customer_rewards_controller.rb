class Api::V1::CustomerRewardsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  
  def index
    authorize! :read, CustomerReward
    
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => params[:venue_id] }, :order => [:points.asc])
    render :template => '/api/v1/customer_rewards/index'
  end
  
  def redeem
    @venue = Venue.get(params[:venue_id]) || not_found
    @reward = CustomerReward.first(:id => params[:id], CustomerReward.merchant.id => @venue.merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    reward_venue = CustomerRewardVenue.first(:customer_reward_id => @reward.id, :venue_id => @venue.id)
    if reward_venue.nil?
      respond_to do |format|
        #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => [t("api.customer_rewards.not_available")] } }
      end
      return
    end
    
    Time.zone = @venue.time_zone
    Customer.transaction do
      begin
        if @customer.points - @reward.points >= 0
          record = RedeemRewardRecord.new(
            :reward_id => @reward.id,
            :venue_id => @venue.id,
            :points => @reward.points,
            :created_ts => Time.now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          @customer.points -= @reward.points
          @customer.save
          data = { 
            :type => EncryptedDataType::REDEEM_REWARD,
            :reward => @reward.to_redeemed,
            :expiry_ts => Time.now+6.hour 
          }.to_json
          cipher = Gibberish::AES.new(@venue.auth_code)
          @encrypted_data = cipher.enc(data)
          render :template => '/api/v1/customer_rewards/redeem'
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [t("api.customer_rewards.insufficient_points")] } }
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