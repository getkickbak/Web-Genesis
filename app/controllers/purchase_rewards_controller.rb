class PurchaseRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, PurchaseReward
    
    @rewards = PurchaseReward.all(:merchant_id => params[:merchant_id])
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @rewards.to_json(:only => [:id, :title, :description, :points]) } }
    end
   end
  
  def earn
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        if @merchant.auth_code == params[:auth_code]
          reward_ids = params[:reward_id]
          reward_ids.each do |reward_id|
            reward = PurchaseReward.first(:merchant_id => @merchant.id, :id => reward_id) || not_found
            record = EarnRewardRecord.new(
              :reward_id => reward.id,
              :points => reward.points,
              :time => now
            )
            record.merchant = @merchant
            record.user = current_user
            record.save
            @customer.points += reward.points
          end
          @customer.save
          success = true
          msg = [""]
        else
          success = false
          msg = [""]
        end  
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true, :msg => ["", ""] } }
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