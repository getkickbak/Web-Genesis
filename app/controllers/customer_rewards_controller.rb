class CustomerRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, CustomerReward
    
    @rewards = CustomerReward.all(CustomerReward.merchant.id => params[:merchant_id], :venues => Venue.all(:id => params[:venue_id]))
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @rewards.to_json } }
    end
   end
  
  def redeem
    @venue = Venue.first(:id => params[:venue_id], Venue.merchant.id => params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        if @venue.auth_code == params[:auth_code] 
          reward = CustomerReward.first(:id => params[:id], CustomerReward.merchant.id => @venue.merchant.id)
          if @customer.points - reward.points >= 0
            record = RedeemRewardRecord.new(
              :reward_id => reward.id,
              :venue_id => @venue.id,
              :points => reward.points,
              :created_ts => now
            )
            record.merchant = @venue.merchant
            record.user = current_user
            record.save
            @customer.points -= reward.points
            @customer.save
            success = true
            data = { :msg => [""] }
          else
            success = false
            data = { :msg => [""] }  
          end
        else
          success = false
          data = { :msg => [""] }    
        end
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => success, :data => data } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :data => { :msg => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } } }
        end
      end
    end
  end
end