class Api::V1::PurchaseRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, PurchaseReward
    
    @rewards = PurchaseReward.all(PurchaseReward.merchant.id => params[:merchant_id], :venues => Venue.all(:id => params[:venue_id]))
    render :template => '/api/v1/purchase_rewards/index'
   end
  
  def earn
    @venue = Venue.first(:id => params[:venue_id], Venue.merchant.id => params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    new_customer = false
    if @customer.nil?
      @customer = Customer.create(@venue.merchant,current_user)        
      new_customer = true
    end
    authorize! :update, @customer
    
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => ["Something went wrong", "Outside of check-in distance.  Please try again."] } }
      end
      return
    end
    
    #Customer.transaction do
      begin
        @prize = nil
        if @venue.authorization_codes.first(:auth_code => params[:auth_code]) || APP_PROP["DEBUG_MODE"]
          now = Time.now
          challenge = Challenge.first(:type => 'referral', :venues => Venue.all(:id => params[:venue_id]))
          if challenge && new_customer
            referral_challenge = ReferralChallenge.first(ReferralChallenge.merchant.id => @venue.merchant.id, :ref_email => current_user.email)
            if referral_challenge
              referral_customer = Customer.first(Customer.merchant.id => @venue.merchant.id, :user_id => referral_challenge.user.id)
              referral_customer.points += challenge.points
              referral_customer.save
            end
          end
          challenge = Challenge.first(:type => 'vip', :venues => Venue.all(:id => params[:venue_id]))
          @vip_challenge = false
          @vip_points = 0
          if challenge && vip_challenge_met?(challenge)
            record = EarnRewardRecord.new(
              :challenge_id => challenge.id,
              :venue_id => @venue.id,
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
          rewards_info = JSON.parse(params[:reward_ids])
          reward_id_quantity = {}
          reward_ids = []
          rewards_info.each do |info|
            reward_ids << info['id']
            reward_id_quantity[info['id']] = info['quantity']
          end
          @total_points = 0
          rewards = PurchaseReward.all(:id => reward_ids)
          rewards.each do |reward|
            points = reward.points * reward_id_quantity[reward.id]
            record = EarnRewardRecord.new(
              :reward_id => reward.id,
              :venue_id => @venue.id,
              :points => points,
              :created_ts => now
            )
            record.merchant = @venue.merchant
            record.user = current_user
            record.save
            @customer.points += points
            @total_points += points
          end
          @customer.save
          
          mutex = CacheMutex.new(@venue.merchant.cache_key, Cache.memcache)
          mutex.acquire
          reward_model = @venue.merchant.reward_model
          prize = CustomerReward.get(reward_model.prize_reward_id)
          if prize.nil?
            prize = pick_prize(@venue)
            reward_model.prize_reward_id = prize.id
            prize_interval = (prize.points / Float(reward_model.prize_rebate_rate) * 100).to_i
            reward_model.prize_win_offset = pick_prize_win_offset(prize_interval)
          else
            prize_interval = (prize.points / Float(reward_model.prize_rebate_rate) * 100).to_i  
          end
          current_point_offset = reward_model.prize_point_offset + @total_points
          if (reward_model.prize_point_offset < reward_model.prize_win_offset) && (current_point_offset >= reward_model.prize_win_offset)
            earn_prize = EarnPrize.new(
              :points => prize.points,
              :expiry_date => 6.month.from_now,
              :created_ts => now
            )
            earn_prize.reward = prize
            earn_prize.merchant = @venue.merchant
            earn_prize.user = current_user
            earn_prize.save
            @prize = earn_prize          
          end
          if current_point_offset >= prize_interval
            current_point_offset -= prize_interval
            prize = pick_prize(@venue)
            reward_model.prize_reward_id = prize.id
            prize_interval = (prize.points / Float(reward_model.prize_rebate_rate) * 100).to_i  
            reward_model.prize_win_offset = pick_prize_win_offset(prize_interval) 
            if @prize.nil? && current_point_offset >= reward_model.prize_win_offset
              earn_prize = EarnPrize.new(
                :points => prize.points,
                :expiry_date => 6.month.from_now,
                :created_ts => now
              )
              earn_prize.reward = prize
              earn_prize.merchant = @venue.merchant
              earn_prize.user = current_user
              earn_prize.save
              @prize = earn_prize
              prize = pick_prize(@venue)
              reward_model.prize_reward_id = prize.id
              prize_interval = (prize.points / Float(reward_model.prize_rebate_rate) * 100).to_i  
              reward_model.prize_win_offset = pick_prize_win_offset(prize_interval)
              current_point_offset = current_point_offset % prize_interval
            elsif current_point_offset >= reward_model.prize_win_offset
              current_point_offset = pick_prize_win_offset(reward_model.prize_win_offset)  
            end
          end
          reward_model.prize_point_offset = current_point_offset
          reward_model.save
          mutex.release
          render :template => '/api/v1/purchase_rewards/earn'
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [""] } }
          end
        end  
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        mutex.release if (defined? mutex && mutex)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        mutex.release if (defined? mutex && mutex)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end  
      end
    #end
  end
  
  private
    
  def vip_challenge_met?(challenge)
    count = EarnRewardRecord.count(EarnRewardRecord.user.id => current_user.id, EarnRewardRecord.merchant.id => challenge.merchant.id)
    challenge.data.visits % count == 0 ? true : false
  end
  
  def pick_prize(venue)
    idx = Random.rand(venue.customer_rewards.length)
    return venue.customer_rewards[idx]
  end
  
  def pick_prize_win_offset(prize_interval)
    Random.rand(prize_interval)
  end
end