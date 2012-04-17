class Api::V1::EarnPrizesController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_user!
  
  def index
    authorize! :read, EarnPrize
    
    if params[:merchant_id]
      @earn_prizes = EarnPrize.all(EarnPrize.merchant.id => params[:merchant_id], EarnPrize.user.id => current_user.id, :expiry_ts.gte => Time.now, :redeemed => false)
    else
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => current_user.id, :redeemed => false)
    end
    render :template => '/api/v1/earn_prizes/index'
  end
  
  def show_venues
    @earn_prize = EarnPrize.get(params[:id]) || not_found
    authorize! :read, @earn_prize  
    
    render :template => '/api/v1/earn_prizes/show_venues'
  end
  
  def redeem
    @earn_prize = EarnPrize.get(params[:id]) || not_found
    authorize! :update, @earn_prize
    
    EarnPrize.transaction do
      begin
        @earn_prize.redeemed = true
        @earn_prize.save
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true, :message => [t("api.earn_prizes.redeem_failure")] } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.earn_prizes.redeem_failure")] } }
        end
      end
    end
  end
end