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
      decrypted_data = JSON.parse(decrypted, { :symbolize_names => true })
      expiry_ts_secs = decrypted_data[:expiry_ts]/1000
      data_expiry_ts = Time.at(expiry_ts_secs)
      #logger.debug("decrypted expiry_ts: #{data_expiry_ts}")
      #logger.debug("Time comparison: #{data_expiry_ts >= Time.now}")
      #Cache expires in 12 hrs
      if (data_expiry_ts >= Time.now) && Cache.add(params[:data], true, 43200)
        @reward = CustomerReward.first(:id => params[:id], :merchant => @venue.merchant)
        raise "Reward(#{params[:id]}) not found" if @reward.nil?
        if params[:frequency] || decrypted_data[:frequency]
          data = { 
            :reward_id => @reward.id,
            :venue_id => @venue.id
          }.to_json
          if params[:frequency]
            frequency = JSON.parse(params[:frequency], { :symbolize_names => true })
          else
            frequency = decrypted_data[:frequency]
          end
          channel_group = Channel.get_group(encrypted_data[0])
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
        end
      else
        raise "Authorization code expired"
      end
    rescue DataMapper::SaveFailureError => e  
      logger.error("Exception: " + e.resource.errors.inspect)
      Cache.delete(params[:data])
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message =>  t("api.customer_rewards.redeem_item_failure").split(/\n/) } }
      end
      return
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      Cache.delete(params[:data])
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message =>  t("api.customer_rewards.redeem_item_failure").split(/\n/) } }
      end
      return  
    end
        
    if params[:frequency] || decrypted_data[:frequency]
      if (response = @request.is_status?(:complete))[:result]
        logger.info("Venue(#{@venue.id}) successfully completed Request(#{@request.id})")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => true } }
        end
      else
        logger.info("Venue(#{@venue.id}) failed to complete Request(#{@request.id})")
        @request.reload
        if response[:data]
          result_data = JSON.parse(response[:data], { :symbolize_names => true })
          message = result_data[:message]
        else
          message = (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/)  
        end  
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message =>  message } }
        end
      end
      @request.destroy if Rails.env == "production"  
    else
      if decrypted_data[:tag_id]
        tag = UserTag.first(:tag_id => decrypted_data[:tag_id], :uid => decrypted_data[:uid])
        if tag
          if tag.status != :active
            logger.info("Tag: #{decrypted_data[:tag_id]} is not active")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.inactive_tag").split(/\n/) } }
            end
            return
          end
          user_to_tag = UserToTag.first(:fields => [:user_id], :user_tag_id => tag.id)
          if user_to_tag.nil?
            logger.error("No user is associated with this tag: #{decrypted_data[:tag_id]}")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.invalid_tag").split(/\n/) } }
            end
            return
          end
          user = User.get(user_to_tag.user_id)
          if user.nil?
            logger.error("No such user: #{user_to_tag.user_id}")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.invalid_user").split(/\n/) } }
            end
            return
          end
        else
          logger.error("No such tag_id: #{decrypted_data[:tag_id]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.invalid_tag").split(/\n/) } }
          end
          return  
        end
      elsif decrypted_data[:phone_id]
        user = User.first(:phone => decrypted_data[:phone_id])
        if user.nil?
          logger.error("No such phone number: #{decrypted_data[:phone_id]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.invalid_phone").split(/\n/) } }
          end
          return 
        end
      else
        logger.error("Missing user identification info")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.missing_user_info").split(/\n/) } }
        end
        return
      end

      @customer = Customer.first(:merchant => @venue.merchant, :user => user)
      if @customer.nil?
        logger.error("User(#{user.id}) is not a customer of Merchant(#{@venue.merchant})")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.invalid_customer").split(/\n/) } }
        end
        return
      end
      redeem_common(user)  
    end
  end
  
  def redeem  
    @venue = Venue.get(params[:venue_id]) || not_found
    @reward = CustomerReward.first(:id => params[:id], :merchant => @venue.merchant) || not_found
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user) || not_found
    authorize! :read, @customer
       
    begin  
      if params[:frequency]
        frequency = JSON.parse(params[:frequency])
      else
        cipher = Gibberish::AES.new(form_authenticity_token)
        decrypted = cipher.dec(params[:data].split('$')[1])
        frequency = JSON.parse(decrypted, { :symbolize_names => true })[:frequency]
      end
      request_info = {
        :type => RequestType::REDEEM,
        :frequency1 => frequency[0],
        :frequency2 => frequency[1],
        :frequency3 => frequency[2],
        :latitude => params[:latitude] || @venue.latitude,
        :longitude => params[:longitude] || @venue.longitude
      }
      @request = Request.match(request_info, current_user)
      if @request.nil?
        logger.info("No matching redeem reward request")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
        end
        return
      else 
        request_data = JSON.parse(@request.data, { :symbolize_names => true })
        if @venue.id != request_data[:venue_id] 
          Request.set_status(@request, :failed)
          logger.error("Mismatch venue information, venue id:#{@venue.id}, merchant venue id:#{request_data[:venue_id]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customer_rewards.venue_mismatch").split(/\n/) } }
          end
          return
        end
        if params[:id].to_i != request_data[:reward_id]
          Request.set_status(@request, :failed, { :message => t("api.customer_rewards.redeem_mismatch_merchant").split(/\n/) }.to_json)
          logger.error("Mismatch rewards, reward_id:#{params[:id].to_i}, request reward_id:#{request_data[:reward_id]}")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customer_rewards.redeem_mismatch_customer").split(/\n/) } }
          end
          return
        end  
      end
    rescue DataMapper::SaveFailureError => e  
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
      end
      return
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message =>  (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
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
        format.json { render :json => { :success => false, :message => t("api.inactive_user").split(/\n/) } }
      end
      return
    end
                  
    if @venue.status != :active
      Request.set_status(@request, :failed)
      logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split(/\n/) } }
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
        format.json { render :json => { :success => false, :message => t("api.customer_rewards.not_available").split(/\n/) } }
      end
      return
    end
    
    Time.zone = @venue.time_zone
    begin
      Customer.transaction do
        @mutex = CacheMutex.new(@customer.mutex_key, Cache.memcache)
        acquired = @mutex.acquire
        @customer.reload
        
        if @reward.time_limited && (@reward.expiry_date < Date.today)
          Request.set_status(@request, :failed)
          logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), time limited")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.no_longer_available") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
          end
          return
        end
        if @reward.quantity_limited && (@reward.quantity_count >= @reward.quantity)
          Request.set_status(@request, :failed)
          logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), quantity limited")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.no_longer_available") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
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
          @rewards = Common.get_rewards_by_venue(@venue, :reward)
          @prizes = Common.get_rewards_by_venue(@venue, :prize)
          eligible_for_reward = !Common.find_eligible_reward(@rewards.to_a, @customer.points).nil?
          eligible_for_prize = !Common.find_eligible_reward(@prizes.to_a, @customer.prize_points).nil?
          @customer.eligible_for_reward = eligible_for_reward
          @customer.eligible_for_prize = eligible_for_prize
          @customer.update_ts = now
          @customer.save
          @account_info[:eligible_for_reward] = eligible_for_reward
          @account_info[:eligible_for_prize] = eligible_for_prize
          Request.set_status(@request, :complete)
          if user.facebook_auth && (session[:version].nil? || session[:version] && session[:version] >= "2.1.2")
            reward_model = @venue.merchant.reward_model
            if reward_model.type.value == "amount_spent"
              message = t("facebook_post.description.amount_spent")
            elsif reward_model.type.value == "items_purchased"
              message = t("facebook_post.description.items_purchased") % [reward_model.rebate_rate]
            elsif reward_model.type.value == "visits"  
              message = t("facebook_post.description.visits") % [reward_model.rebate_rate]
            end
            posts = [
              FacebookPost.new(
                :type => "redeem",
                :message => (t("facebook_post.message.redeem_reward") % [@reward.title, @venue.name]),
                :picture => @venue.merchant.photo.url,
                :link_name => @venue.name,
                :link => business_profile_url(@venue.merchant),
                :caption => "www.getkickbak.com",
                :description => "#{message}\n#{t("facebook_post.description.text")}"
              )
            ]
            Resque.enqueue(ShareOnFacebook, user.id, @venue.id, ShareOnFacebook::REDEEM, posts.to_json)
          end
          render :template => '/api/v1/customer_rewards/redeem' 
          logger.info("User(#{user.id}) successfully redeemed Reward(#{@reward.id}), worth #{@reward.points} points")
        else
          Request.set_status(@request, :failed)
          logger.info("User(#{user.id}) failed to redeem Reward(#{@reward.id}), insufficient points")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customer_rewards.insufficient_points") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
          end  
        end
      end
    rescue DataMapper::SaveFailureError => e  
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
      end
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => (t("api.customer_rewards.redeem_failure") % [@reward.mode == :reward ? t("api.reward") : t("api.prize")]).split(/\n/) } }
      end 
    ensure
      @mutex.release if ((defined? @mutex) && !@mutex.nil?)  
    end
  end
end