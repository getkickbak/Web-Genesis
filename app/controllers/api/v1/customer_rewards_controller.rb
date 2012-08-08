class Api::V1::CustomerRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, CustomerReward
    
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => params[:venue_id] }, :mode => params[:mode].to_sym, :order => [:points.asc])
    reward_id_to_subtype_id = {}
    reward_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward => @rewards)
    reward_to_subtypes.each do |reward_to_subtype|
      reward_id_to_subtype_id[reward_to_subtype.customer_reward_id] = reward_to_subtype.customer_reward_subtype_id
    end        
    @rewards.each do |reward|
      reward.eager_load_type = CustomerRewardSubtype.id_to_type[reward_id_to_subtype_id[reward.id]]
    end
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
        
        if @reward.quantity_limited && (@reward.quantity_count == @reward.quantity)
          logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), quantity limited")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.no_longer_available") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
          end
          return
        end
        if @reward.time_limited && @reward.expiry_date < Date.today
          logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), time limited")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.no_longer_available") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
          end
          return
        end
        
        account_points = (@reward.mode == :reward ? @customer.points : @customer.prize_points) 
        if account_points - @reward.points >= 0
          now = Time.now
          record = RedeemRewardRecord.new(
            :reward_id => @reward.id,
            :venue_id => @venue.id,
            :points => @reward.points,
            :mode => @reward.mode,
            :created_ts => now,
            :update_ts => now
          )
          record.merchant = @venue.merchant
          record.customer = @customer
          record.user = current_user
          record.save
          trans_record = TransactionRecord.new(
            :type => @reward.mode == :reward ? :redeem_reward : :redeem_prize,
            :ref_id => record.id,
            :description => @reward.title,
            :points => -@reward.points,
            :created_ts => now,
            :update_ts => now
          )
          trans_record.merchant = @venue.merchant
          trans_record.customer = @customer
          trans_record.user = current_user
          trans_record.save
          @account_info = {}
          if @reward.mode == :reward
            @customer.points -= @reward.points
            @account_info[:points] = @customer.points
          else
            @customer.prize_points -= @reward.points
            @account_info[:prize_points] = @customer.prize_points
          end  
          if @reward.quantity_limited
            @reward.quantity_count += 1
            @reward.update_ts = now
            @reward.save
          end
          @rewards = Common.get_rewards(@venue, :reward)
          @prizes = Common.get_rewards(@venue, :prize)
          eligible_for_reward = !Common.find_eligible_reward(@rewards.to_a, @customer.points).nil?
          eligible_for_prize = !Common.find_eligible_reward(@prizes.to_a, @customer.prize_points).nil?
          @customer.eligible_for_reward = eligible_for_reward
          @customer.eligible_for_prize = eligible_for_prize
          @customer.update_ts = now
          @customer.save
          @account_info[:eligible_for_reward] = eligible_for_reward
          @account_info[:eligible_for_prize] = eligible_for_prize
          data = { 
            :type => (@reward.mode == :reward ? EncryptedDataType::REDEEM_REWARD : EncryptedDataType::REDEEM_PRIZE),
            :reward => @reward.to_redeemed,
            :expiry_ts => (6.hour.from_now).to_i*1000
          }.to_json
          cipher = Gibberish::AES.new(@venue.auth_code)
          @encrypted_data = "r$#{cipher.enc(data)}"
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
        format.json { render :json => { :success => false, :message => (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
      end 
    ensure
      @mutex.release if ((defined? @mutex) && !@mutex.nil?)  
    end    
  end
end