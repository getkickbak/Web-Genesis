class Api::V1::EarnPrizesController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, EarnPrize
    
    if params[:merchant_id]
      @earn_prizes = EarnPrize.all(EarnPrize.merchant.id => params[:merchant_id], EarnPrize.user.id => current_user.id, :expiry_date.gte => Date.today, :redeemed => false)
    else
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => current_user.id, :expiry_date.gte => Date.today, :redeemed => false)
    end
    merchant_ids = []
    reward_ids = []
    @earn_prizes.each do |prize|
      merchant_ids << prize.merchant.id
      reward_ids << prize.reward.id
    end
    merchant_id_to_type_id = {}
    merchant_to_types = MerchantToType.all(:fields => [:merchant_id, :merchant_type_id], :merchant_id => merchant_ids)
    merchant_to_types.each do |merchant_to_type|
      merchant_id_to_type_id[merchant_to_type.merchant_id] = merchant_to_type.merchant_type_id
    end
    reward_id_to_type_id = {}
    reward_to_types = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_type_id], :customer_reward_id => reward_ids)
    reward_to_types.each do |reward_to_type|
      reward_id_to_type_id[reward_to_type.customer_reward_id] = reward_to_type.customer_reward_type_id
    end
    @earn_prizes.each do |prize|
      prize.merchant.eager_load_type = MerchantType.id_to_type[merchant_id_to_type_id[prize.merchant.id]]
      prize.reward.eager_load_type = CustomerRewardType.id_to_type[reward_id_to_type_id[prize.reward.id]]
    end
    render :template => '/api/v1/earn_prizes/index'
  end
  
  def show_venues
    @earn_prize = EarnPrize.get(params[:id]) || not_found
    authorize! :read, @earn_prize  
    
    venue_id_to_type_id = {}
    venue_to_types = VenueToType.all(:fields => [:venue_id, :venue_type_id], :venue => @earn_prize.venues)
    venue_to_types.each do |venue_to_type|
      venue_id_to_type_id[venue_to_type.venue_id] = venue_to_type.venue_type_id
    end
    merchant_ids = []
    @earn_prize.venues.each do |venue|
      merchant_ids << venue.merchant.id
    end
    merchant_id_to_type_id = {}
    merchant_to_types = MerchantToType.all(:fields => [:merchant_id, :merchant_type_id], :merchant_id => merchant_ids)
    merchant_to_types.each do |merchant_to_type|
      merchant_id_to_type_id[merchant_to_type.merchant_id] = merchant_to_type.merchant_type_id
    end
    venues.each do |venue|
      venue.distance = (rand * 10).round(1)
      venue.eager_load_type = VenueType.id_to_type[venue_id_to_type_id[venue.id]]
      venue.merchant.eager_load_type = MerchantType.id_to_type[merchant_id_to_type_id[venue.merchant.id]]
    end
    render :template => '/api/v1/earn_prizes/show_venues'
  end
  
  def redeem
    @earn_prize = EarnPrize.get(params[:id]) || not_found
    authorize! :update, @earn_prize
 
    logger.info("Redeem Prize(#{@earn_prize.id}), Type(#{@earn_prize.reward.type.value}), Venue(#{@earn_prize.venue.id}), User(#{current_user.id})")
    reward_venue = CustomerRewardVenue.first(:customer_reward_id => @earn_prize.reward.id, :venue_id => @earn_prize.venue.id)
    if reward_venue.nil?
      logger.info("User(#{current_user.id}) failed to redeem Prize(#{@earn_prize.id}), not available at Venue(#{@earn_prize.venue.id})")
      respond_to do |format|
        #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.earn_prizes.not_available").split('\n') } }
      end
      return
    end
    
    Time.zone = @earn_prize.venue.time_zone   
    begin 
      EarnPrize.transaction do
        today = Date.today
        if (@earn_prize.expiry_date >= today) && (not @earn_prize.redeemed)
          @earn_prize.redeemed = true
          @earn_prize.update_ts = Time.now
          @earn_prize.save
          data = { 
            :type => EncryptedDataType::REDEEM_PRIZE, 
            :reward => @earn_prize.to_redeemed,
            :expiry_ts => (6.hour.from_now).to_i*1000
          }.to_json
          cipher = Gibberish::AES.new(@earn_prize.merchant.prize_auth_code)
          @encrypted_data = "p$#{cipher.enc(data)}"
          render :template => '/api/v1/earn_prizes/redeem'
          logger.info("User(#{current_user.id}) successfully redeemed Prize(#{@earn_prize.id})")
        else
          if @earn_prize.expiry_date < today
            msg = t("api.earn_prizes.expired").split('\n')
          else
            msg = t("api.earn_prizes.already_redeemed").split('\n')
          end  
          logger.info("User(#{current_user.id}) failed to redeem Prize(#{@earn_prize.id}), #{msg}")
          respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => msg } }
          end
        end  
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.earn_prizes.redeem_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.earn_prizes.redeem_failure").split('\n') } }
      end  
    end    
  end
end