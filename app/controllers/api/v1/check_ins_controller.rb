class Api::V1::CheckInsController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    if !APP_PROP["SIMULATOR_MODE"] && current_user.role != "test"
      begin
        encrypted_data = params[:auth_code].split('$')
        venue = Venue.get(encrypted_data[0]) || not_found
        cipher = Gibberish::AES.new(venue.auth_code)
        decrypted = cipher.dec(encrypted_data[1])
        decrypted_data = JSON.parse(decrypted)
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.check_ins.invalid_code").split('\n') } }  
        end  
        return
      end
      checkInCode = CheckInCode.first(:auth_code => decrypted_data["auth_code"])
      if checkInCode.nil?
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.check_ins.invalid_code").split('\n') } }  
        end
        return
      end
      @venue = checkInCode.venue
    else
      if params[:venue_id]
        @venue = Venue.get(params[:venue_id])
      else
        @venue = Venue.first(:offset => 0, :limit => 1)
      end
    end  
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    if @customer.nil?
      @customer = Customer.create(@venue.merchant, current_user)
    end
    authorize! :update, @customer
    
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(current_user, params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.out_of_distance").split('\n') } }
      end
      return
    end
    
    @badges = @venue.merchant.badges.sort_by { |b| b.rank }
    if @venue.merchant.custom_badges
      badge_types = MerchantBadgeType.all(MerchantBadgeType.merchant.id => @venue.merchant.id).to_a
    else
      badge_ids = []
      @badges.each do |badge|
        badge_ids << badge.id
      end
      badge_id_to_type_id = {}
      badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
      badge_to_types.each do |badge_to_type|
        badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
      end
      badge_types = []
      @badges.each do |badge|
        badge.eager_load_type = BadgeType.id_to_type[badge_id_to_type_id[badge.id]]
        badge_types << badge.eager_load_type
      end
    end
        
    Common.populate_badge_type_images(request.env['HTTP_USER_AGENT'], @venue.merchant.custom_badges, badge_types)
        
    begin
      CheckIn.transaction do
        now = Time.now
        last_check_in = CheckIn.create(@venue, current_user, @customer)
        @prizes_count = RedeemRewardRecord.count(RedeemRewardRecord.merchant.id => @venue.merchant.id, :mode => :prize, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
        @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
        @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
        @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :mode => :reward, :order => [:points.asc])
        @prizes = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :mode => :prize, :order => [:points.asc])
        reward_id_to_subtype_id = {}
        reward_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward => @rewards)
        reward_to_subtypes.each do |reward_to_subtype|
          reward_id_to_subtype_id[reward_to_subtype.customer_reward_id] = reward_to_subtype.customer_reward_subtype_id
        end    
        prize_id_to_subtype_id = {}
        prize_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward => @prizes)
        prize_to_subtypes.each do |prize_to_subtype|
          prize_id_to_subtype_id[prize_to_subtype.customer_reward_id] = prize_to_subtype.customer_reward_subtype_id
        end    
        @rewards.each do |reward|
          reward.eager_load_type = CustomerRewardSubtype.id_to_type[reward_id_to_subtype_id[reward.id]]       
        end
        @prizes.each do |prize|
          prize.eager_load_type = CustomerRewardSubtype.id_to_type[prize_id_to_subtype_id[prize.id]]         
        end
        @newsfeed = []
        promotions = Promotion.all(:merchant => @venue.merchant)
        promotions.each do |promotion|
          @newsfeed << News.new(
            "",
            0,
            "",
            "",
            promotion.message
          )
        end
        render :template => '/api/v1/check_ins/create'
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.check_ins.create_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.check_ins.create_failure").split('\n') } }
      end  
    end    
  end
end