class PurchaseRewardsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, PurchaseReward
    
    @rewards = PurchaseReward.all(PurchaseReward.merchant.id => params[:merchant_id], :venues => Venue.all(:id => params[:venue_id]))
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @rewards.to_json } }
    end
   end
  
  def earn
    @venue = Venue.all(:id => params[:venue_id], Venue.merchant.id => params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    new_customer = false
    if @customer.nil?
      @customer = Customer.create(@venue.merchant,current_user)        
      new_customer = true
    end
    authorize! :update, @customer
    
    if !Common.within_geo_distance?(params[:latitude], params[:longitude], @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.html { render :action => "new" }
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => ["Something went wrong", "Outside of check-in distance.  Please try again."] } }
      end
      return
    end
    
    Customer.transaction do
      begin
        data = []
        if @venue.auth_code == params[:auth_code]
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
          vip_challenge = false
          vip_points = 0
          if challenge && vip_challenge_met?(challenge)
            record = EarnRewardRecord.new(
              :venue_id => @venue.id,
              :points => challenge.points,
              :created_ts => now
            )
            record.merchant = @venue.merchant
            record.user = current_user
            record.save
            @customer.points += challenge.points
            vip_challenge = true
            vip_points = challenge.points
          end
          reward_ids = params[:reward_ids]
          total_points = 0
          rewards = PurchaseReward.all(:id => reward_ids)
          rewards.each do |reward|
            @customer.points += reward.points
            total_points += reward.points
          end
          @customer.save
          record = EarnRewardRecord.new(
            :venue_id => @venue.id,
            :points => total_points,
            :created_ts => now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          
          mutex = CacheMutex.new(@venue.merchant.cache_key, Cache.memcache)
          mutex.acquire
          reward_model = @venue.merchant.reward_model
          prize = CustomerReward.get(reward_model.prize_reward_id) || pick_prize(@venue)
          current_point_offset = reward_model.prize_point_offset + total_points
          if (reward_model.prize_point_offset < reward_model.prize_win_offset) && (current_point_offset > reward_model.prize_win_offset)
              earn_prize = EarnPrize.new(
                :points => prize.points,
                :expiry_date => 6.month.from_now,
                :created_ts => now
              )
              earn_prize.reward = prize
              earn_prize.merchant = @venue.merchant
              earn_prize.user = current_user
              earn_prize.save
              data << prize          
          end
          prize_interval = (prize.points / Float(reward_model.prize_rebate_rate) * 100).to_i
          while current_point_offset >= prize_interval
            prize = pick_prize(@venue)
            reward_model.prize_reward_id = prize.id
            if current_point_offset >= prize_interval
              reward_model.prize_point_offset = current_point_offset - prize_interval
            else
              reward_model.prize_point_offset = current_point_offset
            end  
            prize_interval = (prize.points / Float(reward_model.prize_rebate_rate) * 100).to_i
            reward_model.prize_win_offset = pick_prize_win_offset(prize_interval)  
            reward_model.save
            current_point_offset = reward_model.prize_point_offset - prize_interval
            if current_point_offset > reward_model.prize_win_offset
              earn_prize = EarnPrize.new(
                :points => prize.points,
                :created_ts => now
              )
              earn_prize.reward = prize
              earn_prize.merchant = @venue.merchant
              earn_prize.user = current_user
              earn_prize.save 
              data << prize       
            end  
          end
          mutex.release
          respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => success, :data => { :vip_challenge => vip_challenge, :vip_points => vip_points }, :metaData => { :prizes => data.to_json }, :message => [""] } }
          end
        else
          respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [""] } }
          end
        end  
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end
      rescue
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end  
      ensure 
        mutex.release if defined? mutex && mutex  
      end
    end
  end
  
  private
    
  def vip_challenge_met?(challenge)
    count = EarnRewardRecord.count(EarnRewardRecord.user.id => current_user.id, EarnRewardRecord.merchant.id => challenge.merchant.id)
    challenge.data.visits % count == 0 ? true : false
  end
  
  def pick_prize(venue)
    idx = Random.rand(venue.customer_rewards.length)
    return venue.customer_rewards.get(idx)
  end
  
  def pick_prize_win_offset(prize_interval)
    Random.rand(prize_interval)
  end
end