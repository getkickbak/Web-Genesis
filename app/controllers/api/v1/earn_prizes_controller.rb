class Api::V1::EarnPrizesController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_user!
  
  def index
    authorize! :read, EarnPrize
    
    if params[:merchant_id]
      @earn_prizes = EarnPrize.all(EarnPrize.merchant.id => params[:merchant_id], EarnPrize.user.id => current_user.id, :expiry_ts.gte => Time.now, :redeemed => false)
    else
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => current_user.id, :expiry_ts.gte => Time.now, :redeemed => false)
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
 
    reward_venue = CustomerRewardVenue.first(:customer_reward_id => @earn_prize.reward.id, :venue_id => @earn_prize.venue.id)
    if reward_venue.nil?
      respond_to do |format|
        #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => [t("api.earn_prizes.not_available")] } }
      end
      return
    end
    
    Time.zone = @earn_prize.venue.time_zone   
    EarnPrize.transaction do
      begin
        now = Time.now
        if (@earn_prize.expiry_ts >= now) && (not @earn_prize.redeemed)
          @earn_prize.redeemed = true
          @earn_prize.update_ts = Time.now
          @earn_prize.save
          aes = Aes.new('128', 'CBC')
          iv = String.random_alphanumeric
          data = { 
            :type => "redeem_prize", 
            :title => @earn_prize.reward.title,
            :expiry_date => Date.today 
          }.to_json
          @encrypted_data = "#{iv}$#{aes.encrypt(data, @venue.auth_code, iv)}"
          render :template => '/api/v1/earn_prizes/redeem'
        else
          if @earn_prize.expiry_ts < now
            msg = t("api.earn_prizes.expired")
          else
            msg = t("api.earn_prizes.already_redeemed")
          end  
          respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [msg] } }
          end
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