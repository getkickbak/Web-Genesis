class Api::V1::PurchaseRewardsController < Api::V1::BaseApplicationController
  before_filter :authenticate_user!
  
  def earn
    authorize! :update, Customer

    @venue_id = params[:venue_id]
    authorized = false
    invalid_code = false
    sign_up_code = false
    if APP_PROP["SIMULATOR_MODE"]
      if @venue_id.nil?
        @venue = Venue.first(:offset => 0, :limit => 1)
      else
        @venue = Venue.get(@venue_id) || not_found
      end
      data = String.random_alphanumeric(32)
      data_expiry_ts = Time.now
      amount = rand(100)+1
      authorized = true
    else
      begin
        if current_user.role == "test"
          if @venue_id.nil?
            @venue = Venue.first(:offset => 0, :limit => 1)
          else
            @venue = Venue.get(@venue_id) || not_found
          end
        else
          encrypted_data = params[:data].split('$')
          if encrypted_data.length != 2
            raise "Invalid authorization code format"
          end
          match_pattern = /^(\d*)$/.match(encrypted_data[0])
          if match_pattern
            @venue = Venue.get(encrypted_data[0])
            if @venue.nil?
              raise "No such venue: #{encrypted_data[0]}"
            end
            if (@venue_id && (@venue.id != @venue_id.to_i))
              raise "Venue information don't match', venue_id:#{@venue_id}, venue id:#{@venue.id}"
            end
          else
            match_pattern = /^m(\d*)$/.match(encrypted_data[0])
            if match_pattern
              merchant = Merchant.get(match_pattern[1])
              if merchant.nil?
                raise "No such merchant: #{match_pattern[1]}"
              end
              sign_up_code = true
              @venue = Venue.find_nearest(current_user, merchant.id, params[:latitude], params[:longitude], 1).first
            else
              raise "Invalid authorization code"
            end
          end  
        end
        data = encrypted_data[1]
        #logger.debug("data: #{data}")
        if merchant
          cipher = Gibberish::AES.new(merchant.auth_code)
          decrypted = cipher.dec(data)
          #logger.debug("decrypted text: #{decrypted}")
          decrypted_data = JSON.parse(decrypted)
          amount = 0.00
          authorized = true
        else
          cipher = Gibberish::AES.new(@venue.auth_code)
          decrypted = cipher.dec(data)
          #logger.debug("decrypted text: #{decrypted}")
          decrypted_data = JSON.parse(decrypted)
          now_secs = decrypted_data["expiry_ts"]/1000
          data_expiry_ts = Time.at(now_secs)
          #logger.debug("decrypted type: #{decrypted_data["type"]}")
          #logger.debug("decrypted expiry_ts: #{data_expiry_ts}")
          #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::EARN_POINTS}")
          #logger.debug("Time comparison: #{data_expiry_ts >= Time.now}")
          #logger.debug("EarnRewardRecord doesn't exists: #{EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => data_expiry_ts, :data => data).nil?}")
          if (decrypted_data["type"] == EncryptedDataType::EARN_POINTS) && (data_expiry_ts >= Time.now)
            if EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => data_expiry_ts, :data => data).nil?
              amount = decrypted_data["amount"].to_f
              #logger.debug("Set authorized to true")
              authorized = true
            end
          else
            invalid_code = true
          end
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        if @venue.nil?
          logger.info("User(#{current_user.id}) failed to earn points, invalid authorization code")
        else
          logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), invalid authorization code")
        end
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.invalid_code").split('\n') } }
        end
        return
      end
    end

    if @venue.status != :active
      logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), venue is not active")
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
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user)
    if @customer.nil?
      if (@venue.merchant.role == "merchant" && current_user.role == "user") || (@venue.merchant.role == "test" && current_user.role == "test") || current_user.role = "admin"
        @customer = Customer.create(@venue.merchant, current_user)
      else
        logger.info("User(#{current_user.id}) failed to earn points at Merchant(#{@venue.merchant.id}), account not compatible with merchant")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split('\n') } }
        end
        return
      end
    elsif sign_up_code
      if @customer.visits > 0
        logger.info("User(#{current_user.id}) failed to earn sign up points at Merchant(#{@venue.merchant.id}), already signed up")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.already_signed_up").split('\n') } }
        end
        return
      end
    end

    logger.info("Earn Points at Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")

    if @venue.merchant.will_terminate && (Date.today > (@venue.merchant.terminate_date - 30))
      logger.info("User(#{current_user.id}) failed to earn points at Merchant(#{@venue.merchant.id}), program is being terminated")
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
          @reward_info = { :points => 0, :referral_points => 0, :prize_points => 0, :badge_prize_points => 0, :eligible_prize_id => 0 }
          now = Time.now
          challenge_type_id = ChallengeType.value_to_id["referral"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          referral_challenge = false
          if challenge && (referral_record = ReferralChallengeRecord.first(:referral_id => @customer.id, :status => :pending))
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
            referral_reward_record.user = current_user
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
            referral_trans_record.user = current_user
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

          logger.info("Test to see if this is the first visit and if we have signup_points")
          if @customer.visits == 1 && reward_model.signup_points > 0
            logger.info("We are getting some signup_points")
            record = EarnRewardRecord.new(
              :type => :signup,
              :venue_id => @venue.id,
              :points => reward_model.signup_points,
              :created_ts => now,
              :update_ts => now
            )
            record.merchant = @venue.merchant
            record.customer = @customer
            record.user = current_user
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
            trans_record.user = current_user
            trans_record.save
            @customer.points += reward_model.signup_points
            @reward_info[:signup_points] = reward_model.signup_points
          end

          if amount > 0.00
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
            record.user = current_user
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
            trans_record.user = current_user
            trans_record.save
            @customer.points += points
            @reward_info[:points] = points
          end

          logger.info("About to grab a mutex")
          #logger.debug("Before acquiring cache mutex.")
          @venue_mutex = CacheMutex.new(@venue.cache_key, Cache.memcache)
          acquired = @venue_mutex.acquire
          #logger.debug("Cache mutex acquired(#{acquired}).")
          @pick_prize_initialized = false
          reward_model = @venue.merchant.reward_model
          (reward_model.avg_spend = (reward_model.avg_spend * reward_model.total_visits + amount) / (reward_model.total_visits + 1).round(2)) if amount > 0.00
          reward_model.total_visits += 1
          reward_model.save
          
          if amount > 0.00
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
            prize_record.user = current_user
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
            prize_trans_record.user = current_user
            prize_trans_record.save
          end
          if @customer.badge_reset_ts <= @venue.merchant.badges_update_ts
            @customer.badge, @customer.next_badge_visits = Common.find_badge(@badges.to_a, @customer.visits)
            @customer.badge_reset_ts = now
          end
          next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
          if (@customer.next_badge_visits >= next_badge.visits) && (@customer.badge.id != next_badge.id)
            adjustment_ratio = APP_PROP["BADGE_REBATE_RATE"] / (100 - APP_PROP["BADGE_REBATE_RATE"])
            badge_prize_points_average = (reward_model.avg_spend * next_badge.visits * adjustment_ratio / reward_model.price_per_prize_point).to_i
            badge_prize_points_diff = badge_prize_points_average / 2
            min_badge_prize_points = badge_prize_points_average - badge_prize_points_diff
            max_badge_prize_points = badge_prize_points_average + badge_prize_points_diff
            badge_prize_points = Random.rand(max_badge_prize_points - min_badge_prize_points + 1) + min_badge_prize_points
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
            badge_prize_record.user = current_user
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
            badge_prize_trans_record.user = current_user
            badge_prize_trans_record.save
          end
          logger.info("At the end now")
          @prize_jackpots = EarnPrizeRecord.count(:merchant => @venue.merchant, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
          @account_info = {}
          @account_info[:visits] = @customer.visits
          @account_info[:next_badge_visits] = @customer.next_badge_visits
          @account_info[:points] = @customer.points
          @account_info[:prize_points] = @customer.prize_points
          @account_info[:badge_id] = @customer.badge.id
          @account_info[:next_badge_id] = next_badge.id
          logger.info("Determining rewards and prizes")
          rewards = Common.get_rewards(@venue, :reward)
          prizes = Common.get_rewards(@venue, :prize)
          logger.info("Previous prize points: #{previous_prize_points}, Current prize points: #{@customer.prize_points}")
          eligible_prize = Common.find_eligible_reward(prizes.to_a, @customer.prize_points - previous_prize_points)
          logger.info("Eligible prize is nil: #{eligible_prize.nil?}")
          @reward_info[:eligible_prize_id] = eligible_prize.id if !eligible_prize.nil?
          eligible_for_reward = !Common.find_eligible_reward(rewards.to_a, @customer.points).nil?
          eligible_for_prize = !Common.find_eligible_reward(prizes.to_a, @customer.prize_points).nil?
          logger.info("Find eligible rewards and prizes")
          @customer.eligible_for_reward = eligible_for_reward
          @customer.eligible_for_prize = eligible_for_prize
          @customer.update_ts = now
          @customer.save
          logger.info("Just save the customer object")
          @account_info[:eligible_for_reward] = eligible_for_reward
          @account_info[:eligible_for_prize] = eligible_for_prize
          if @venue_id.nil?
            @rewards = rewards
            @prizes = prizes
          end
          render :template => '/api/v1/purchase_rewards/earn'
          if referral_challenge
            UserMailer.referral_challenge_confirm_email(referrer.user, @customer.user, @venue, referral_record).deliver
          end
          logger.info("User(#{current_user.id}) successfully earned #{@reward_info[:points]} points, #{@reward_info[:referral_points]} referral points, #{@reward_info[:prize_points]} prize points, #{@reward_info[:badge_prize_points]} badge prize points at Venue(#{@venue.id})")
        else
          if invalid_code
            msg = t("api.purchase_rewards.invalid_code").split('\n')
            logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), invalid authorization code")
          else
            msg = t("api.purchase_rewards.expired_code").split('\n')
            logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), authorization code expired")
          end
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => msg } }
          end
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
      end
    rescue StandardError => e
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

  private

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