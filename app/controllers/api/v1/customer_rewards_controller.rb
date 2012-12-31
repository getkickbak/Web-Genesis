class Api::V1::CustomerRewardsController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_redeem]
  before_filter :authenticate_user!, :except => [:merchant_redeem]
  skip_authorization_check :only => [:merchant_redeem]
  
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
      #logger.debug("decrypted expiry_ts: #{data_expiry_ts}")
      #logger.debug("Time comparison: #{data_expiry_ts >= Time.now}")
      #Cache expires in 12 hrs
      if (data_expiry_ts >= Time.now) && Cache.add(params[:data], true, 43200)
        authorized = true
      else
        invalid_code = true
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      Cache.delete(params[:data])
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message =>  t("api.customer_rewards.redeem_item_failure").split('\n') } }
      end
      return  
    end
    
    @reward = CustomerReward.first(:id => params[:id], :merchant => @venue.merchant) || not_found

    if params[:frequency]
      begin   
        data = { 
            :reward_id => @reward.id
        }.to_json
        frequency = JSON.parse(params[:frequency])
        channel_group = Channel.get_group
        request_info = {
          :type => RequestType::REDEEM,
          :frequency1 => frequency[0],
          :frequency2 => frequency[1],
          :frequency3 => frequency[2],
          :latitude => @venue.latitude,
          :longitude => @venue.longitude,
          :data => data,
          :channel_group => channel_group,
          :channel => Channel.reserve(channel_group)
        }
        @request = Request.create(request_info)
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
        end
        return  
      end 
      if @request.is_status?(:complete)
        render :template => '/api/v1/customer_rewards/merchant_redeem'  
        logger.info("Venue(#{@venue.id}) successfully completed Request(#{@request.id})")
      else
        logger.info("Venue(#{@venue.id}) failed to complete Request(#{@request.id})")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
        end
      end
      @request.destroy if Rails.env == "production"
    else
      if authorized
        tag = UserTag.first(:tag_id => decrypted_data["tag_id"])
        if tag.nil?
          logger.error("No such tag: #{decrypted_data["tag_id"]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.invalid_tag").split('\n') } }
          end
          return
        end
        if tag.status != :active
          logger.info("Tag: #{decrypted_data["tag_id"]} is not active")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.inactive_tag").split('\n') } }
          end
          return
        end
        user_to_tag = UserToTag.first(:fields => [:user_id], :user_tag_id => tag.id)
        if user_to_tag.nil?
          logger.error("No user is associated with this tag: #{decrypted_data["tag_id"]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.invalid_tag").split('\n') } }
          end
          return
        end
        user = User.get(user_to_tag.user_id)
        if user.nil?
          logger.error("No such user: #{user_to_tag.user_id}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.invalid_user").split('\n') } }
          end
          return
        end
        @customer = Customer.first(:merchant => @venue.merchant, :user => user)
        if @customer.nil?
          logger.error("User(#{user.id}) is not a customer of Merchant(#{@venue.merchant})")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.invalid_customer").split('\n') } }
          end
          return
        end
        redeem_common(user)
      else
        if invalid_code
          logger.info("Merchant(#{@venue.merchant.id}) failed to redeem Reward(#{params[:id]}) for User(#{user.id}), invalid authorization code")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
          end
        else
          logger.info("Merchant(#{@venue.merchant.id}) failed to redeem Reward(#{params[:id]}) for User(#{user.id}), authorization code expired")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
          end 
        end 
      end  
    end
  end
  
  def redeem  
    @venue = Venue.get(params[:venue_id]) || not_found
    @reward = CustomerReward.first(:id => params[:id], :merchant => @venue.merchant) || not_found
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user) || not_found
    authorize! :read, @customer
       
    begin  
      frequency = JSON.parse(params[:frequency])
      channel_group = Channel.get_group
      request_info = {
        :type => RequestType::REDEEM,
        :frequency1 => frequency[0],
        :frequency2 => frequency[1],
        :frequency3 => frequency[2],
        :latitude => params[:latitude] || @venue.latitude,
        :longitude => params[:longitude] || @venue.longitude,
        :channel_group => channel_group,
        :channel => Channel.reserve(channel_group)
      }
      @request = Request.match(request_info)
      if @request.nil?
        logger.info("No matching redeem reward request")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
        end
        return
      else 
        request_data = JSON.parse(@request.data)
        if params[:id] != request_data["reward_id"]
          Request.set_status(@request, :failed)
          logger.info("params[:id] is an integer: #{params[:id].is_a? Integer}")
          logger.info("params[:id] is a string #{params[:id].is_a? String}")
          logger.info("request_data['reward_id'] is an integer: #{request_data["reward_id"].is_a? Integer}")
          logger.info("request_data['reward_id''] is a string #{request_data["reward_id"].is_a? String}")
          logger.error("Mismatch rewards, reward_id:#{params[:id]}, request reward_id:#{request_data["reward_id"]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_mismatch").split('\n') } }
          end
          return
        end  
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
      end
      return
    end
    
    redeem_common(current_user)
  end
  
  private
  
  def redeem_common(user)
    logger.info("Redeem Reward(#{@reward.id}), Type(#{@reward.type.value}), Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{user.id})")

    if user.status != :active
      Request.set_status(@request, :failed)
      logger.error("User: #{@current_user.id} is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.inactive_user").split('\n') } }
      end
      return
    end
                  
    if @venue.status != :active
      Request.set_status(@request, :failed)
      logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split('\n') } }
      end
      return  
    end
    
    reward_venue = CustomerRewardVenue.first(:customer_reward_id => @reward.id, :venue_id => @venue.id)
    if reward_venue.nil?
      Request.set_status(@request, :failed)
      logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), not available at venue")
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
          Request.set_status(@request, :failed)
          logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), time limited")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.no_longer_available") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split('\n') } }
          end
          return
        end
        if @reward.quantity_limited && (@reward.quantity_count >= @reward.quantity)
          Request.set_status(@request, :failed)
          logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), quantity limited")
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
          record.user = user
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
          trans_record.user = user
          trans_record.save
          if @reward.mode == :reward
            @customer.points -= @reward.points
          else
            @customer.prize_points -= @reward.points
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
          Request.set_status(@request, :complete)
          render :template => '/api/v1/customer_rewards/redeem'
          logger.info("User(#{user.id}) successfully redeemed Reward(#{@reward.id}), worth #{@reward.points} points")
        else
          Request.set_status(@request, :failed)
          logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), insufficient points")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customer_rewards.insufficient_points").split('\n') } }
          end  
        end
      end
    rescue StandardError => e
      Request.set_status(@request, :failed)
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