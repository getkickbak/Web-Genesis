class Api::V1::PurchaseRewardsController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_user!
  
  def earn
    @venue = Venue.get(params[:venue_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    logger.info("Earn Points at Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.out_of_distance").split('\n') } }
      end
      return
    end
    
    @prize = nil
    authorized = false
    invalid_code = false
    if APP_PROP["DEBUG_MODE"]
      data = String.random_alphanumeric(32)
      data_expiry_ts = Time.now
      amount = rand(100)+1
      authorized = true
    else
      begin
        data = params[:data]
        cipher = Gibberish::AES.new(@venue.auth_code)
        decrypted = cipher.dec(data)
        #logger.debug("decrypted text: #{decrypted}")
        decrypted_data = JSON.parse(decrypted)
        now_secs = decrypted_data["expiry_ts"]/1000
        data_expiry_ts = Time.at(now_secs)
        #logger.debug("decrypted type: #{decrypted_data["type"]}")
        #logger.debug("decrypted expiry_ts: #{data_expiry_ts}")
        #logger.debug("decrypted data: #{data}")
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
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), invalid authentication code")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.invalid_code").split('\n') } }
        end  
        return
      end
    end    
      
    begin  
      Customer.transaction do
        if authorized
          #logger.debug("Authorized to earn points.")
          now = Time.now
          challenge_type_id = ChallengeType.value_to_id["referral"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          @referral_challenge = false
          @referral_points = 0
          if challenge && (@customer.visits == 0) && (referral_record = ReferralChallengeRecord.first(:referral_id => @customer.id, :status => :pending))
            referrer = Customer.get(referral_record.referrer_id)
            referrer_reward_record = EarnRewardRecord.new(
              :challenge_id => challenge.id,
              :venue_id => @venue.id,
              :data => "",
              :data_expiry_ts => ::Constant::MIN_TIME,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            referrer_reward_record.merchant = @venue.merchant
            referrer_reward_record.user = referrer.user
            referrer_reward_record.save
            referral_reward_record = EarnRewardRecord.new(
              :challenge_id => challenge.id,
              :venue_id => @venue.id,
              :data => "",
              :data_expiry_ts => ::Constant::MIN_TIME,
              :points => challenge.data.referral_points,
              :created_ts => now,
              :update_ts => now
            )
            referral_reward_record.merchant = @venue.merchant
            referral_reward_record.user = current_user
            referral_reward_record.save
            referrer.points += challenge.points
            referrer.save
            @customer.points += challenge.data.referral_points
            referral_record.status = :complete
            referral_record.update_ts = now
            referral_record.save
            @referral_challenge = true
            @referral_points = challenge.data.referral_points
          end
          challenge_type_id = ChallengeType.value_to_id["vip"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          @vip_challenge = false
          @vip_points = 0
          if challenge && vip_challenge_met?(@customer.visits+1, challenge)
            record = EarnRewardRecord.new(
              :challenge_id => challenge.id,
              :venue_id => @venue.id,
              :data => "",
              :data_expiry_ts => ::Constant::MIN_TIME,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            record.merchant = @venue.merchant
            record.user = current_user
            record.save
            @customer.points += challenge.points
            @vip_challenge = true
            @vip_points = challenge.points
          end
          @customer.visits += 1
          reward_model = @venue.merchant.reward_model
          @points = (amount / reward_model.price_per_point).to_i
          record = EarnRewardRecord.new(
            :venue_id => @venue.id,
            :data => data,
            :data_expiry_ts => data_expiry_ts,
            :points => @points,
            :amount => amount,
            :created_ts => now,
            :update_ts => now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          @customer.points += @points
          @customer.save
        
          #logger.debug("Before acquiring cache mutex.")
          mutex = CacheMutex.new(@venue.cache_key, Cache.memcache)
          acquired = mutex.acquire
          #logger.debug("Cache mutex acquired(#{acquired}).")
          @prick_prize_initialized = false
          reward_model = @venue.merchant.reward_model
          prize_info = @venue.prize_info
          prize = CustomerReward.get(prize_info.prize_reward_id)
          if prize.nil?
            prize = pick_prize()
            prize_info.prize_reward_id = prize.id
            prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i
            prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
          else
            prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i  
          end
          current_point_offset = prize_info.prize_point_offset + @points
          #logger.debug("Check if Prize has been won yet.")
          won_prize_before = EarnPrize.count(EarnPrize.user.id => current_user.id, EarnPrize.merchant.id => @venue.merchant.id) > 0
          if (prize_info.prize_point_offset < prize_info.prize_win_offset)
            if (current_point_offset >= prize_info.prize_win_offset) || ((@customer.visits > 1) && !won_prize_before)
              earn_prize = EarnPrize.new(
                :points => prize.points,
                :expiry_date => 6.month.from_now,
                :created_ts => now
              )
              earn_prize.reward = prize
              earn_prize.merchant = @venue.merchant
              earn_prize.venue = @venue
              earn_prize.user = current_user
              earn_prize.save
              @prize = earn_prize 
            end             
            if (current_point_offset < prize_info.prize_win_offset) && ((@customer.visits > 1) && !won_prize_before)
              prize_info.prize_win_offset = current_point_offset
            end
          end
          if current_point_offset >= prize_interval
            #logger.debug("Current Point Offset >= Prize Interval.")
            current_point_offset -= prize_interval
            prize = pick_prize()
            prize_info.prize_reward_id = prize.id
            prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i  
            prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
            if @prize.nil? && ((current_point_offset >= prize_info.prize_win_offset) || ((@customer.visits > 1) && !won_prize_before))
              earn_prize = EarnPrize.new(
                :points => prize.points,
                :expiry_date => 6.month.from_now,
                :created_ts => now
              )
              earn_prize.reward = prize
              earn_prize.merchant = @venue.merchant
              earn_prize.venue = @venue
              earn_prize.user = current_user
              earn_prize.save
              @prize = earn_prize
              if current_point_offset >= prize_info.prize_win_offset
                prize = pick_prize()
                prize_info.prize_reward_id = prize.id
                prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i  
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
          @rewards.each do |reward|
            item = EligibleReward.new(
              reward.id,
              reward.type.value,
              reward.title,
              ::Common.get_eligible_reward_text(@customer.points - reward.points)
            )
            @eligible_rewards << item  
          end
          if @referral_challenge
            UserMailer.referral_challenge_confirm_email(referrer.user, @customer.user, @venue, referral_record)
          end
          logger.info("User(#{current_user.id}) successfully earned #{@points} at Venue(#{@venue.id})")
          render :template => '/api/v1/purchase_rewards/earn'
          mutex.release
          #logger.debug("Cache mutex released.")
        else
          if invalid_code
            msg = t("api.purchase_rewards.invalid_code").split('\n')
            logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), invalid authentication code")
          else
            msg = t("api.purchase_rewards.expired_code").split('\n')
            logger.info("User(#{current_user.id}) failed to earn points at Venue(#{@venue.id}), authentication code expired")
          end
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => msg } }
          end
        end  
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      mutex.release if ((defined? mutex) && !mutex.nil?)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      mutex.release if ((defined? mutex) && !mutex.nil?)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split('\n') } }
      end  
    end    
  end
  
  private
    
  def vip_challenge_met?(customer_visits, challenge)
    if customer_visits > 0
      return customer_visits % challenge.data.visits == 0 ? true : false
    end  
    return false
  end
  
  def pick_prize
    if not @pick_prize_initialized
      @prize_section = []
      total_points = 0
      lcm = 1
      @venue.customer_rewards.each do |reward|
        total_points += reward.points
        #puts("reward: #{reward.title} - points: #{reward.points}")
        lcm = lcm.lcm(reward.points)
        #puts("lcm: #{lcm}")
      end
      @total_prize_section_points = 0
      @venue.customer_rewards.each do |reward|
        @total_prize_section_points += (lcm / reward.points * total_points)  
        #puts("total_prize_section_points: #{@total_prize_section_points}")
        @prize_section << @total_prize_section_points
      end
      @pick_prize_initialized = true
    end
    chosen_section = Random.rand(@total_prize_section_points) + 1
    #puts("chosen section: #{chosen_section}")
    idx = @prize_section.bsearch_upper_boundary {|x| x <=> chosen_section}
    #puts("chosen idx: #{idx}")
    return @venue.customer_rewards[idx]
  end
  
  def pick_prize_win_offset(prize_interval)
    Random.rand(prize_interval)
  end
end