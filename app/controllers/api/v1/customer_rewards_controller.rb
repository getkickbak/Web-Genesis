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
    
    logger.info("Redeem Reward(#{@reward.id}), Type(#{@reward.type.value}), Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")
    reward_venue = CustomerRewardVenue.first(:customer_reward_id => @reward.id, :venue_id => @venue.id)
    if reward_venue.nil?
      logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), not available at Venue(#{@venue.id})")
      respond_to do |format|
        #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.not_available").split('\n') } }
      end
      return
    end
    
    Time.zone = @venue.time_zone
    begin
      Customer.transaction do
        @mutex = CacheMutex.new(@customer.cache_key, Cache.memcache)
        acquired = @mutex.acquire
        @customer.reload
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
            :expiry_ts => (6.hour.from_now).to_i*1000
          }.to_json
          cipher = Gibberish::AES.new(@venue.auth_code)
          @encrypted_data = cipher.enc(data)
          @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :order => [:points.asc])
          @eligible_rewards = []
          challenge_type_id = ChallengeType.value_to_id["vip"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          if challenge
            visits_to_go = @customer.visits % challenge.data.visits
            (visits_to_go = challenge.data.visits) unless visits_to_go > 0
            item = EligibleReward.new(
              challenge.id,
              challenge.type.value,
              challenge.name,
              ::Common.get_eligible_challenge_vip_text(challenge.points, visits_to_go)
            )
            @eligible_rewards << item
          end
          reward_id_to_type_id = {}
          reward_to_types = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_type_id], :customer_reward => @rewards)
          reward_to_types.each do |reward_to_type|
            reward_id_to_type_id[reward_to_type.customer_reward_id] = reward_to_type.customer_reward_type_id
          end
          @rewards.each do |reward|
            reward.eager_load_type = CustomerRewardType.id_to_type[reward_id_to_type_id[reward.id]]
            item = EligibleReward.new(
              reward.id,
              reward.eager_load_type.value,
              reward.title,
              ::Common.get_eligible_reward_text(@customer.points - reward.points)
            )
            @eligible_rewards << item  
          end
          render :template => '/api/v1/customer_rewards/redeem'
          logger.info("User(#{current_user.id}) successfully redeemed Reward(#{@reward.id}), worth #{@reward.points} points")
        else
          logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), insufficient points")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customer_rewards.insufficient_points").split('\n') } }
          end  
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_failure").split('\n') } }
      end 
    ensure
      @mutex.release if ((defined? @mutex) && !@mutex.nil?)  
    end    
  end
end