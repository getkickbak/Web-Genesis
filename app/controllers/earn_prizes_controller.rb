class EarnPrizesController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, EarnPrize
    
    if params[:merchant_id]
      @earn_prizes = EarnPrize.all(EarnPrize.merchant.id => params[:merchant_id], EarnPrize.user.id => current_user.id, :redeemed => false)
    else
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => current_user.id, :redeemed => false)
    end
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @earn_prizes.to_json } }
    end
  end
  
  def show
    @earn_prize = EarnPrize.get(params[:id])
    authorize! :read, @earn_prize  
    
    @reward = PurchaseReward.get(@earn_prize.reward.id)
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @reward.venues.to_json } }
    end
  end
  
  def redeem
    @earn_prize = EarnPrize.get(params[:id])
    authorize! :update, EarnPrize
    
    EarnPrize.transaction do
      begin
        if @venue.auth_code == params[:auth_code]
          @earn_prize.redeemed = true
          @earn_prize.save
          success = true
          data = { :msg => [""] }
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
          format.json { render :json => { :success => false, :data => { :msg => ["Something went wrong", "Please try again."] } } }
        end
      end
    end
  end
end