class Api::V1::PurchaseRewardsController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_earn]
  before_filter :authenticate_user!, :except => [:merchant_earn]
  skip_authorization_check :only => [:merchant_earn]
  
  def earn
    authorize! :update, Customer

    begin
      venue = Venue.get(params[:venue_id])
      frequency = JSON.parse(params[:frequency])
      request_info = {
        :type => RequestType::EARN_POINTS,
        :frequency1 => frequency[0],
        :frequency2 => frequency[1],
        :frequency3 => frequency[2],
        :latitude => params[:latitude] || venue.latitude,
        :longitude => params[:longitude] || venue.longitude
      }  
      @request = Request.match(request_info)
      if @request.nil?
        logger.info("No matching earn points request")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
        end
        return
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
      end
      return
    end
      
    earn_common
  end
  
  def merchant_earn
    invalid_code = false
    authorized = false
    begin      
      encrypted_data = params[:data].split('$')
      if encrypted_data.length != 2
        raise "Invalid authorization code format"
      end
      match_pattern = /^(\d*)$/.match(encrypted_data[0])
      if match_pattern
        venue = Venue.get(encrypted_data[0])
        if venue.nil?
          raise "No such venue: #{encrypted_data[0]}"
        end
      else
        raise "Invalid authorization code"
      end
      data = encrypted_data[1]
      #logger.debug("data: #{data}")
      cipher = Gibberish::AES.new(venue.auth_code)
      decrypted = cipher.dec(data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted) 
      now_secs = decrypted_data["expiry_ts"]/1000
      data_expiry_ts = Time.at(now_secs)  
      if decrypted_data["type"] == EncryptedDataType::EARN_POINTS
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
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
      end
      return
    end
    
    if params[:frequency]
      begin
        venue = Venue.get(params[:venue_id])
        frequency = JSON.parse(params[:frequency])
        channel_group = Channel.get_group(params[:venue_id])
        request_info = {
          :type => RequestType::EARN_POINTS,
          :frequency1 => frequency[0],
          :frequency2 => frequency[1],
          :frequency3 => frequency[2],
          :latitude => venue.latitude,
          :longitude => venue.longitude,
          :data => params[:data],
          :channel_group => channel_group,
          :channel => Channel.reserve(channel_group)
        }
        @request = Request.create(request_info) 
      rescue StandardError => e  
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
        end
        return
      end    
     
      if @request.is_status?(:complete)
        logger.info("Venue(#{venue.id}) successfully completed Request(#{@request.id})")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true } }
        end  
      else
        logger.info("Venue(#{venue.id}) failed to complete Request(#{@request.id})")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
        end
      end
      @request.destroy if Rails.env == "production"
    else
      earn_common
    end      
  end
  
  private

  def earn_common
    @venue_id = params[:venue_id]
    authorized = false
    invalid_code = false
    if signed_in? && APP_PROP["SIMULATOR_MODE"]
      if @venue_id.nil?
        @venue = Venue.first(:offset => 0, :limit => 1)
      else
        @venue = Venue.get(@venue_id) || not_found
      end
      data = String.random_alphanumeric(32)
      data_expiry_ts = Time.now
      amount = Random.rand(100)+1
      authorized = true
    else
      begin
        if signed_in?
          data = @request.data
        else
          data = params[:data]
        end
        
        encrypted_data = data.split('$')
        if encrypted_data.length != 2
          raise "Invalid authorization code format"
        end
        match_pattern = /^(\d*)$/.match(encrypted_data[0])
        if match_pattern
          @venue = Venue.get(encrypted_data[0])
          if @venue.nil?
            raise "No such venue: #{encrypted_data[0]}"
          end
          if @venue_id && (@venue.id != @venue_id.to_i)
            Request.set_status(@request, :failed)
            logger.error("Mismatch venue information', venue_id:#{@venue_id}, venue id:#{@venue.id}")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.purchase_rewards.venue_mismatch").split('\n') } }
            end
            return
          end
        else
          raise "Invalid authorization code"
        end        
        data = encrypted_data[1]
        #logger.debug("data: #{data}")
        cipher = Gibberish::AES.new(@venue.auth_code)
        decrypted = cipher.dec(data)
        #logger.debug("decrypted text: #{decrypted}")
       
        decrypted_data = JSON.parse(decrypted)
        now_secs = decrypted_data["expiry_ts"]/1000
        data_expiry_ts = Time.at(now_secs)
        if not signed_in?
          tag = UserTag.first(:tag_id => decrypted_data["tag_id"])
          if tag.nil?
            logger.error("No such tag: #{decrypted_data["tag_id"]}")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.invalid_tag").split('\n') } }
            end
            return
          end
          if tag.status == :suspended || tag.status == :deleted
            logger.info("Tag: #{decrypted_data["tag_id"]} is suspended or deleted ")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.invalid_tag").split('\n') } }
            end
            return
          end
          user_to_tag = UserToTag.first(:fields => [:user_id], :user_tag_id => tag.id)
          if user_to_tag.nil? && tag.status == :pending
            user_info = {}
            user_info[:name] = "KICKBAK #{String.random_alphanumeric(8)}"
            user_info[:email] = "#{String.random_alphanumeric(16)}@getkickbak.com"
            user_info[:role] = "user"
            user_info[:status] = :pending
            password = String.random_alphanumeric(8)
            user_info[:password] = password
            user_info[:password_confirmation] = password
            @current_user = User.create(user_info)
            @current_user.register_tag(tag)
          else
            if user_to_tag
              @current_user = User.get(user_to_tag.user_id)
              if @current_user.nil?
                logger.error("No such user: #{user_to_tag.user_id}")
                respond_to do |format|
                  #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                  format.json { render :json => { :success => false, :message => t("api.invalid_user").split('\n') } }
                end
                return
              end
            else
              logger.error("No user is associated with this non-pending tag: #{decrypted_data["tag_id"]}")
              respond_to do |format|
                #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                format.json { render :json => { :success => false, :message => t("api.invalid_tag").split('\n') } }
              end
              return
            end  
          end  
        else
          @current_user = current_user  
        end
        if @current_user.status != :active
          Request.set_status(@request, :failed)
          logger.error("User: #{@current_user.id} is not active")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.inactive_user").split('\n') } }
          end
          return
        end
        #logger.debug("decrypted type: #{decrypted_data["type"]}")
        #logger.debug("decrypted expiry_ts: #{data_expiry_ts}")
        #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::EARN_POINTS}")
        #logger.debug("Time comparison: #{data_expiry_ts >= Time.now}")
        #logger.debug("EarnRewardRecord doesn't exists: #{EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => data_expiry_ts, :data => data).nil?}")
        if decrypted_data["type"] == EncryptedDataType::EARN_POINTS
          if (data_expiry_ts >= Time.now) && EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => data_expiry_ts, :data => data).nil?
            amount = decrypted_data["amount"].to_f
            if amount >= 1.00
              #logger.debug("Set authorized to true")
              authorized = true
            else
              raise "Amount must be >= 1.00"  
            end
          end
        else
          invalid_code = true
        end
      rescue StandardError => e
        Request.set_status(@request, :failed)
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
        end
        return
      end
    end

    if @venue.status != :active
      Request.set_status(@request, :failed)
      logger.info("User(#{@current_user.id}) failed to earn points at Venue(#{@venue.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split('\n') } }
      end
      return
    end
    if @venue_id.nil?
      @venue.eager_load_type = @venue.type
      @venue.merchant.eager_load_type = @venue.merchant.type
    end
    @customer = Customer.first(:merchant => @venue.merchant, :user => @current_user)
    if @customer.nil?
      if (@venue.merchant.role == "merchant" && @current_user.role == "user") || (@venue.merchant.role == "test" && @current_user.role == "test") || @current_user.role = "admin"
        @customer = Customer.create(@venue.merchant, @current_user)
      else
        Request.set_status(@request, :failed)
        logger.info("User(#{@current_user.id}) failed to earn points at Merchant(#{@venue.merchant.id}), account not compatible with merchant")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split('\n') } }
        end
        return
      end
    end

    logger.info("Earn Points at Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{@current_user.id})")

    if @venue.merchant.will_terminate && (Date.today > (@venue.merchant.terminate_date - 30))
      Request.set_status(@request, :failed)
      logger.info("User(#{@current_user.id}) failed to earn points at Merchant(#{@venue.merchant.id}), program is being terminated")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.program_termination").split('\n') } }
      end
      return
    end

    @badges = Common.populate_badges(@venue.merchant, session[:user_agent] || :iphone, session[:resolution] || :mxhdpi)

    Time.zone = @venue.time_zone
    begin
      Customer.transaction do
        if authorized
          @customer_mutex = CacheMutex.new(@customer.cache_key, Cache.memcache)
          acquired = @customer_mutex.acquire
          @customer.reload
          #logger.debug("Authorized to earn points.")
          prize_points = 1
          @reward_info = { :points => 0, :signup_points => 0, :referral_points => 0, :prize_points => 0, :badge_prize_points => 0, :eligible_prize_id => 0 }
          now = Time.now
          challenge_type_id = ChallengeType.value_to_id["referral"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          referral_challenge = false
          if challenge && (referral_record = ReferralChallengeRecord.first(:referral_id => @customer.id, :status => :pending)) && (referral_record.referrer_id != @customer.id)
            referrer = Customer.get(referral_record.referrer_id)
            @referrer_mutex = CacheMutex.new(referrer.cache_key, Cache.memcache)
            acquired = @referrer_mutex.acquire
            referrer.reload
            referrer_reward_record = EarnRewardRecord.new(
              :type => :challenge,
              :ref_id => challenge.id,
              :venue_id => @venue.id,
              :data => "",
              :data_expiry_ts => ::Constant::MIN_TIME,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            referrer_reward_record.merchant = @venue.merchant
            referrer_reward_record.customer = referrer
            referrer_reward_record.user = referrer.user
            referrer_reward_record.save
            referrer_trans_record = TransactionRecord.new(
              :type => :earn_points,
              :ref_id => referrer_reward_record.id,
              :description => challenge.name,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            referrer_trans_record.merchant = @venue.merchant
            referrer_trans_record.customer = referrer
            referrer_trans_record.user = referrer.user
            referrer_trans_record.save
            referral_reward_record = EarnRewardRecord.new(
              :type => :challenge,
              :ref_id => challenge.id,
              :venue_id => @venue.id,
              :data => "",
              :data_expiry_ts => ::Constant::MIN_TIME,
              :points => challenge.data.referral_points,
              :created_ts => now,
              :update_ts => now
            )
            referral_reward_record.merchant = @venue.merchant
            referral_reward_record.customer = @customer
            referral_reward_record.user = @current_user
            referral_reward_record.save
            referral_trans_record = TransactionRecord.new(
              :type => :earn_points,
              :ref_id => referral_reward_record.id,
              :description => challenge.name,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            referral_trans_record.merchant = @venue.merchant
            referral_trans_record.customer = @customer
            referral_trans_record.user = @current_user
            referral_trans_record.save
            referrer.points += challenge.points
            referrer.update_ts = now
            referrer.save
            @customer.points += challenge.data.referral_points
            referral_record.status = :complete
            referral_record.update_ts = now
            referral_record.save
            referral_challenge = true
            @reward_info[:referral_points] = challenge.data.referral_points
          end
          @customer.visits += 1
          @customer.next_badge_visits += 1

          reward_model = @venue.merchant.reward_model

          if @customer.visits == 1 && reward_model.signup_points > 0
            record = EarnRewardRecord.new(
              :type => :signup,
              :venue_id => @venue.id,
              :points => reward_model.signup_points,
              :created_ts => now,
              :update_ts => now
            )
            record.merchant = @venue.merchant
            record.customer = @customer
            record.user = @current_user
            record.save
            trans_record = TransactionRecord.new(
              :type => :signup_points,
              :ref_id => record.id,
              :description => I18n.t("transaction.signup"),
              :points => reward_model.signup_points,
              :created_ts => now,
              :update_ts => now
            )
            trans_record.merchant = @venue.merchant
            trans_record.customer = @customer
            trans_record.user = @current_user
            trans_record.save
            @customer.points += reward_model.signup_points
            @reward_info[:signup_points] = reward_model.signup_points
          end

          points = (amount / reward_model.price_per_point).to_i
          record = EarnRewardRecord.new(
            :type => :purchase,
            :venue_id => @venue.id,
            :data => data,
            :data_expiry_ts => data_expiry_ts,
            :points => points,
            :amount => amount,
            :created_ts => now,
            :update_ts => now
          )
          record.merchant = @venue.merchant
          record.customer = @customer
          record.user = @current_user
          record.save
          trans_record = TransactionRecord.new(
            :type => :earn_points,
            :ref_id => record.id,
            :description => I18n.t("transaction.earn"),
            :points => points,
            #:fee => amount * APP_PROP["TRANS_FEE"],
            :created_ts => now,
            :update_ts => now
          )
          trans_record.merchant = @venue.merchant
          trans_record.customer = @customer
          trans_record.user = @current_user
          trans_record.save
          @customer.points += points
          @reward_info[:points] = points

          #logger.debug("Before acquiring cache mutex.")
          @venue_mutex = CacheMutex.new(@venue.cache_key, Cache.memcache)
          acquired = @venue_mutex.acquire
          #logger.debug("Cache mutex acquired(#{acquired}).")
          @pick_prize_initialized = false
          reward_model = @venue.merchant.reward_model
          (reward_model.avg_spend = (reward_model.avg_spend * reward_model.total_visits + amount) / (reward_model.total_visits + 1).round(2)) if amount > 0.00
          reward_model.total_visits += 1
          reward_model.save
          
          prize_info = @venue.prize_info
          if prize_info.prize_interval == 0
            prize_interval = pick_prize_interval(reward_model, @venue)
            prize_info.prize_interval = prize_interval
            prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
          else
            prize_interval = prize_info.prize_interval
          end
          current_point_offset = prize_info.prize_point_offset + points
          #logger.debug("Check if Prize has been won yet.")
          won_prize_before = EarnPrizeRecord.count(:customer => @customer, :type => :game, :points.gt => 1) > 0
          if (prize_info.prize_point_offset < prize_info.prize_win_offset)
            if (current_point_offset >= prize_info.prize_win_offset) || ((@customer.visits > 1) && !won_prize_before)
              prize_points = prize_interval
            end
            if (current_point_offset < prize_info.prize_win_offset) && ((@customer.visits > 1) && !won_prize_before)
              prize_info.prize_win_offset = current_point_offset
            end
          end
          if current_point_offset >= prize_interval
            #logger.debug("Current Point Offset >= Prize Interval.")
            current_point_offset -= prize_interval
            prize_interval = pick_prize_interval(reward_model, @venue)
            prize_info.prize_interval = prize_interval
            prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
            if (prize_points == 1) && ((current_point_offset >= prize_info.prize_win_offset) || ((@customer.visits > 1) && !won_prize_before))
              prize_points = prize_interval
              if current_point_offset >= prize_info.prize_win_offset
                prize_interval = pick_prize_interval(reward_model, @venue)
                prize_info.prize_interval = prize_interval
                prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
                current_point_offset = current_point_offset % prize_interval
              else
                prize_info.prize_win_offset = current_point_offset
              end
            elsif current_point_offset >= prize_info.prize_win_offset
              current_point_offset = pick_prize_win_offset(prize_info.prize_win_offset - 1) + 1
            end
          end
          #logger.debug("Set Prize Point Offset = Current Point Offset.")
          prize_info.prize_point_offset = current_point_offset
          prize_info.save

          previous_prize_points = @customer.prize_points
          @customer.prize_points += prize_points
          @reward_info[:prize_points] = prize_points

          prize_record = EarnPrizeRecord.new(
            :type => :game,
            :venue_id => @venue.id,
            :points => prize_points,
            :created_ts => now,
            :update_ts => now
          )
          prize_record.merchant = @venue.merchant
          prize_record.customer = @customer
          prize_record.user = @current_user
          prize_record.save
          prize_trans_record = TransactionRecord.new(
            :type => :earn_prize_points,
            :ref_id => prize_record.id,
            :description => I18n.t("transaction.earn"),
            :points => prize_points,
            :created_ts => now,
            :update_ts => now
          )
          prize_trans_record.merchant = @venue.merchant
          prize_trans_record.customer = @customer
          prize_trans_record.user = @current_user
          prize_trans_record.save
          
          if @customer.badge_reset_ts <= @venue.merchant.badges_update_ts
            @customer.badge, @customer.next_badge_visits = Common.find_badge(@badges.to_a, @customer.visits)
            @customer.badge_reset_ts = now
          end
          next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
          if (@customer.next_badge_visits >= next_badge.visits) && (@customer.badge.id != next_badge.id)
            adjustment_ratio = APP_PROP["BADGE_REBATE_RATE"] / (100 - APP_PROP["BADGE_REBATE_RATE"]).to_f
            #logger.debug("adjustment ratio: #{adjustment_ratio}")
            #logger.debug("avg spend: #{reward_model.avg_spend}")
            #logger.debug("next badge visits: #{next_badge.visits}")
            #logger.debug("price per prize point: #{reward_model.price_per_prize_point}")
            badge_prize_points_average = (reward_model.avg_spend * next_badge.visits * adjustment_ratio / reward_model.price_per_prize_point).to_i
            #logger.debug("badge prize points average: #{badge_prize_points_average}")
            badge_prize_points_diff = badge_prize_points_average / 2
            #logger.debug("badge prize points diff: #{badge_prize_points_diff}")
            min_badge_prize_points = badge_prize_points_average - badge_prize_points_diff
            max_badge_prize_points = badge_prize_points_average + badge_prize_points_diff
            #logger.debug("min badge prize points: #{min_badge_prize_points}")
            #logger.debug("max badge prize points: #{max_badge_prize_points}")
            badge_prize_points = Random.rand(max_badge_prize_points - min_badge_prize_points + 1) + min_badge_prize_points
            #logger.debug("badge_prize_points: #{badge_prize_points}")
            @customer.badge = next_badge
            @customer.prize_points += badge_prize_points
            @customer.next_badge_visits = 0
            next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
            @reward_info[:badge_prize_points] = badge_prize_points

            badge_prize_record = EarnPrizeRecord.new(
              :type => :badge,
              :venue_id => @venue.id,
              :points => badge_prize_points,
              :created_ts => now,
              :update_ts => now
            )
            badge_prize_record.merchant = @venue.merchant
            badge_prize_record.customer = @customer
            badge_prize_record.user = @current_user
            badge_prize_record.save
            badge_prize_trans_record = TransactionRecord.new(
              :type => :earn_prize_points,
              :ref_id => badge_prize_record.id,
              :description => I18n.t("transaction.earn"),
              :points => badge_prize_points,
              :created_ts => now,
              :update_ts => now
            )
            badge_prize_trans_record.merchant = @venue.merchant
            badge_prize_trans_record.customer = @customer
            badge_prize_trans_record.user = @current_user
            badge_prize_trans_record.save
          end
          @prize_jackpots = EarnPrizeRecord.count(:merchant => @venue.merchant, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
          @account_info = {}
          @account_info[:visits] = @customer.visits
          @account_info[:next_badge_visits] = @customer.next_badge_visits
          @account_info[:points] = @customer.points
          @account_info[:prize_points] = @customer.prize_points
          @account_info[:badge_id] = @customer.badge.id
          @account_info[:next_badge_id] = next_badge.id
          rewards = Common.get_rewards(@venue, :reward)
          prizes = Common.get_rewards(@venue, :prize)
          eligible_prize = Common.find_eligible_reward(prizes.to_a, @customer.prize_points - previous_prize_points)
          @reward_info[:eligible_prize_id] = eligible_prize.id if !eligible_prize.nil?
          eligible_for_reward = !Common.find_eligible_reward(rewards.to_a, @customer.points).nil?
          eligible_for_prize = !Common.find_eligible_reward(prizes.to_a, @customer.prize_points).nil?
          @customer.eligible_for_reward = eligible_for_reward
          @customer.eligible_for_prize = eligible_for_prize
          @customer.update_ts = now
          @customer.save
          @account_info[:eligible_for_reward] = eligible_for_reward
          @account_info[:eligible_for_prize] = eligible_for_prize
          if @venue_id.nil?
            @rewards = rewards
            @prizes = prizes
          end
          Request.set_status(@request, :complete)
          render :template => '/api/v1/purchase_rewards/earn'
          if tag && (@reward_info[:prize_points] > 1 || @reward_info[:badge_prize_points] > 0)
            UserMailer.reward_notif_email(@customer, @reward_info).deliver
          end
          if referral_challenge
            UserMailer.referral_challenge_confirm_email(referrer.user, @customer.user, @venue, referral_record).deliver
          end
          logger.info("User(#{@current_user.id}) successfully earned #{@reward_info[:points]} points, #{@reward_info[:signup_points]} signup points, #{@reward_info[:referral_points]} referral points, #{@reward_info[:prize_points]} prize points, #{@reward_info[:badge_prize_points]} badge prize points at Venue(#{@venue.id})")
        else
          Request.set_status(@request, :failed)
          if invalid_code
            logger.info("User(#{@current_user.id}) failed to earn points at Venue(#{@venue.id}), invalid authorization code")
          else
            logger.info("User(#{@current_user.id}) failed to earn points at Venue(#{@venue.id}), authorization code expired")
          end
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
          end
        end
      end
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
      end
    ensure
      @venue_mutex.release if ((defined? @venue_mutex) && !@venue_mutex.nil?)
      @referrer_mutex.release if ((defined? @referrer_mutex) && !@referrer_mutex.nil?)
      @customer_mutex.release if ((defined? @customer_mutex) && !@customer_mutex.nil?)
    end
  end
  
  def pick_prize_interval(reward_model, venue)
    if not @pick_prize_initialized
      @prize_rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => venue.id }, :mode => :prize, :order => [:points.asc])
      @min_prize_points = @prize_rewards.first.points
      @max_prize_points = @prize_rewards.last.points
      @pick_prize_initialized = true
    end
    Random.rand(@max_prize_points - @min_prize_points + 1) + @min_prize_points
  end

  def pick_prize_win_offset(prize_interval)
    Random.rand(prize_interval)
  end
end