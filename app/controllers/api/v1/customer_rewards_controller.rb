class Api::V1::CustomerRewardsController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_redeem, :merchant_redeem_verify]
  before_filter :authenticate_user!, :except => [:merchant_redeem, :merchant_redeem_verify]
  skip_authorization_check :only => [:merchant_redeem, :merchant_redeem_verify, :redeem_verify_request]
  
  def index
    @venue = Venue.get(params[:venue_id]) || not_found
    authorize! :read, @venue
    
    customer_reward_venues = CustomerRewardVenue.all(:fields => [:customer_reward_id], :venue_id => @venue.id)
    customer_reward_ids = []
    customer_reward_venues.each do |reward_venue|
      customer_reward_ids << reward_venue.customer_reward_id
    end
    @rewards = CustomerReward.all(:id => customer_reward_ids, :mode => params[:mode].to_sym, :order => [:points.asc])
    reward_id_to_subtype_id = {}
    reward_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward_id => customer_reward_ids)
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
    @reward = CustomerReward.first(:id => params[:id], :merchant => @venue.merchant) || not_found
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user) || not_found
    authorize! :update, @customer
    
    redeem_common(current_user)    
  end
  
  def merchant_redeem
    invalid_code = false
    authorized = false
    begin
      encrypted_data = params[:data].split('$')
      if encrypted_data.length != 2
        raise "Invalid authorization code format"
      end
      @venue = Venue.get(encrypted_data[0])
      if @venue.nil?
        raise "No such venue: #{encrypted_data[0]}"
      end
      data = encrypted_data[1]
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      now_secs = decrypted_data["expiry_ts"]/1000
      data_expiry_ts = Time.at(now_secs)
      current_user = User.get(decrypted_data["user_id"])
      if current_user.nil?
        raise "No such user: #{decrypted_data["user_id"]}"
      end
      @reward = CustomerReward.get(decrypted_data["reward_id"])
      if @reward.nil?
        raise "No such reward: #{decrypted_data["reward_id"]}"
      end
      @customer = Customer.first(:merchant => @venue.merchant, :user => current_user)
      if @customer.nil?
        raise "User(#{current_user.id}) is not a customer of Merchant(#{@venue.merchant})"
      end
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted expiry_ts: #{data_expiry_ts}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::REDEEM_REWARD}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::REDEEM_PRIZE}")
      #logger.debug("Time comparison: #{data_expiry_ts >= Time.now}")
      if decrypted_data["type"] == EncryptedDataType::REDEEM_REWARD || decrypted_data["type"] == EncryptedDataType::REDEEM_PRIZE
        # Cache expires in 12 hrs
        if (data_expiry_ts >= Time.now) && Cache.add(params[:data], true, 43200)
          authorized = true
        end
      else
        invalid_code = true
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      Cache.delete(params[:data])
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.invalid_code").split('\n') } }
      end
      return  
    end
    
    if authorized
      redeem_common(current_user)
    else
      if invalid_code
        logger.info("Merchant(#{@venue.merchant.id}) failed to redeem Reward(#{@reward.id}) for User(#{current_user.id}), invalid authorization code")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.customer_rewards.invalid_code").split('\n') } }
        end
      else
        logger.info("Merchant(#{@venue.merchant.id}) failed to redeem Reward(#{@reward.id}) for User(#{current_user.id}), authorization code expired")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.customer_rewards.expired_code").split('\n') } }
        end 
      end 
    end
  end
  
  def redeem_verify_request        
    begin  
      Request.transaction do
        data = { 
            :type => EncryptedDataType::REDEEM_VERIFY,
            :reward_id => params[:reward_id]
        }.to_json
        request_info = {
          :type => RequestType.REDEEM_VERIFY,
          :frequency1 => params[:frequency1],
          :frequency2 => params[:frequency2],
          :frequency3 => params[:frequency3],
          :latitude => params[:latitude],
          :longitude => params[:longitude],
          :data => data
        }
        Request.create(params)
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true } }
        end
      end  
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_verify_request_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_verify_request_failure").split('\n') } }
      end
    end
  end
  
  def merchant_redeem_verify
    @venue = Venue.get(params[:venue_id]) || not_found
    
    Time.zone = @venue.time_zone
    authorized = false
    begin
      if params[:data].nil?
        request_info = {
          :type => RequestType.REDEEM_VERIFY,
          :frequency1 => params[:frequency1],
          :frequency2 => params[:frequency2],
          :frequency3 => params[:frequency3],
          :latitude => params[:latitude],
          :longitude => params[:longitude]
        }
        request_id, data = Common.match_request(request_info)
        if data.nil?
          raise "No matching redeem verify request"
        end
        decrypted_data = JSON.parse(decrypted) 
      else
        data = params[:data]  
        cipher = Gibberish::AES.new(@venue.auth_code)
        decrypted = cipher.dec(data)
        #logger.debug("decrypted text: #{decrypted}")
        decrypted_data = JSON.parse(decrypted) 
      end    
      data_expiry_ts = Time.at(decrypted_data["expiry_ts"]/1000)
      # Cache expires in 12 hrs
      if (decrypted_data["type"] == EncryptedDataType::REDEEM_VERIFY) && (data_expiry_ts >= Time.now) && Cache.add(data, true, 43200) && (@reward = CustomerReward.get(decrypted_data["reward_id"]))
        authorized = true
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      Cache.delete(data)
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.invalid_code").split('\n') } }
      end  
      return
    end
    
    begin
      Customer.transaction do
        if authorized
          Request.destroy(request_id) if request_id > 0
          render :template => '/api/v1/customer_rewards/merchant_redeem_verify' 
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customer_rewards.expired_code").split('\n') } }
          end
        end  
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      Cache.delete(data)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_verify_request_failure").split('\n') } }
      end
    end
  end
  
  private
  
  def redeem_common(current_user)
    logger.info("Redeem Reward(#{@reward.id}), Type(#{@reward.type.value}), Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")

    if @venue.status != :active
      logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split('\n') } }
      end
      return  
    end
    
    reward_venue = CustomerRewardVenue.first(:customer_reward_id => @reward.id, :venue_id => @venue.id)
    if reward_venue.nil?
      logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), not available at venue")
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
        
        if @reward.time_limited && (@reward.expiry_date < Date.today)
          logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), time limited")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.no_longer_available") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
          end
          return
        end
        if @reward.quantity_limited && (@reward.quantity_count >= @reward.quantity)
          logger.info("User(#{current_user.id}) failed to redeem Reward(#{@reward.id}), quantity limited")
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
          @encrypted_data = "#{@reward.mode == :reward ? 'r' : 'p'}$#{cipher.enc(data)}"
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