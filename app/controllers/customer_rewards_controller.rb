class CustomerRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, CustomerReward
    
    @rewards = CustomerReward.all(:merchant_id => params[:merchant_id])
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @rewards.to_json(:only => [:id, :title, :description, :points]) } }
    end
   end
  
  def find_eligible_rewards
    @merchant = Merchant.first(params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :read , CustomerReward
    
    @rewards = CustomerReward.all(:conditions => ["merchant_id = ? AND points <= ?", params[:merchant_id], @customer.points])
    @rewards.push(CustomerReward.all(:conditions => ["merchant_id = ? AND points > ?", params[:merchant_id], @customer.points], :order => [:points.asc], :offset => 0, :limit => 1))
    @eligible_rewards = []
    @rewards.each do |reward|
      item = EligibleReward.new(
        :reward_id => reward.id,
        :reward_title => reward.title,
        :points_difference => (@customer.points - reward.points).abs
      )
      @eligible_rewards << item  
    end
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @eligible_rewards.to_json() } }
    end  
  end
  
  def redeem
    @merchant = Merchant.first(params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        if @customer.auth_code == params[:auth_code] 
          reward = CustomerReward.get(params[:reward_id])
          if @customer.points - reward.points >= 0
            record = RedeemRewardRecord.new(
              :reward_id => reward.id,
              :points => reward.points,
              :time => now
            )
            record.merchant = @merchant
            record.user = current_user
            record.save
            @customer.points -= reward.points
            @customer.save
            success = true
            msg = [""]
          else
            success = false
            msg = [""]  
          end
        else
          success = false
          msg = [""]    
        end
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => success, :msg => msg } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :msg => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end
      end
    end
  end
end