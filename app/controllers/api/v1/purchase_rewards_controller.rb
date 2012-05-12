class Api::V1::PurchaseRewardsController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_user!
  
  def earn
    @venue = Venue.get(params[:venue_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.out_of_distance")] } }
      end
      return
    end
    
    Customer.transaction do
      begin
        @prize = nil
        authorized = false
        if APP_PROP["SIMULATOR_MODE"] || APP_PROP["DEBUG_MODE"]
          data = String.random_alphanumeric
          auth_data = String.random_alphanumeric
          amount = rand(100)+1
          authorized = true
        else
          data = params[:data].split('$')
          iv = data[0]
          auth_data = data[1]
          aes = Aes.new('128', 'CBC')
          decrypted = aes.decrypt(auth_data, @venue.auth_code, iv)
          decrypted_data = JSON.parse(decrypted)
          if (decrypted_data[:type] == EncryptedDataType::EARN_POINTS) && (decrypted_data[:expiry_ts] >= Time.now) && (not EarnRewardRecord.first(:data => data).nil?)
            amount = decrypted_data[:amount]
            authorized = true
          end  
        end  
        if authorized
          #logger.debug("Authorized to earn points.")
          now = Time.now
          challenge_type_id = ChallengeType.value_to_id["vip"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          @vip_challenge = false
          @vip_points = 0
          if challenge && vip_challenge_met?(@customer.visits+1, challenge)
            record = EarnRewardRecord.new(
              :challenge_id => challenge.id,
              :venue_id => @venue.id,
              :data => data,
              :points => challenge.points,
              :created_ts => now
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
            :points => @points,
            :amount => amount,
            :created_ts => now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          @customer.points += @points
          @customer.save
        
          #logger.debug("Before acquiring cache mutex.")
          mutex = CacheMutex.new(@venue.merchant.cache_key, Cache.memcache)
          mutex.acquire
          #logger.debug("Cache mutex acquired(#{acquired}).")
          @prick_prize_initialized = false
          reward_model = @venue.merchant.reward_model
          prize = CustomerReward.get(reward_model.prize_reward_id)
          if prize.nil?
            prize = pick_prize()
            reward_model.prize_reward_id = prize.id
            prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i
            reward_model.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
          else
            prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i  
          end
          current_point_offset = reward_model.prize_point_offset + @points
          #logger.debug("Check if Prize has been won yet.")
          last_prize_won = EarnPrize.first(EarnPrize.user.id => current_user.id, :order => [:created_ts.desc], :offset => 0, :limit => 1)
          if (reward_model.prize_point_offset < reward_model.prize_win_offset)
            if (current_point_offset >= reward_model.prize_win_offset) || ((@customer.visits == 2) && last_prize_won.nil?)
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
            if (@customer.visits == 2) && last_prize_won.nil? && (current_point_offset < reward_model.prize_win_offset)
              reward_model.prize_win_offset = current_point_offset
            end
          end
          if current_point_offset >= prize_interval
            #logger.debug("Current Point Offset >= Prize Interval.")
            current_point_offset -= prize_interval
            prize = pick_prize()
            reward_model.prize_reward_id = prize.id
            prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i  
            reward_model.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
            if @prize.nil? && ((current_point_offset >= reward_model.prize_win_offset) || ((@customer.visits == 2) && last_prize_won.nil?))
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
              if current_point_offset >= reward_model.prize_win_offset
                prize = pick_prize()
                reward_model.prize_reward_id = prize.id
                prize_interval = (prize.price / reward_model.price_per_point / reward_model.prize_rebate_rate * 100).to_i  
                reward_model.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
                current_point_offset = current_point_offset % prize_interval
              else
                reward_model.prize_win_offset = current_point_offset  
              end
            elsif current_point_offset >= reward_model.prize_win_offset
              current_point_offset = pick_prize_win_offset(reward_model.prize_win_offset - 1) + 1  
            end
          end
          #logger.debug("Set Prize Point Offset = Current Point Offset.")
          reward_model.prize_point_offset = current_point_offset
          reward_model.save
          mutex.release
          #logger.debug("Cache mutex released.")
          render :template => '/api/v1/purchase_rewards/earn'
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [t("api.purchase_rewards.earn_failure")] } }
          end
        end  
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        mutex.release if (defined? mutex && mutex)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.purchase_rewards.earn_failure")] } }
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        mutex.release if (defined? mutex && mutex)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.purchase_rewards.earn_failure")] } }
        end  
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