class Api::V1::VenuesController < ApplicationController
  before_filter :authenticate_user!
  
  def explore
    @venue = Venue.get(params[:id]) || not_found
    authorize! :read, @venue

    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    is_customer = true
    if @customer.nil?
      @customer = Customer.new
      @customer.id = 0
      @customer.points = 0
      @customer.prize_points = 0
      @customer.last_check_in = CheckIn.new
      @customer.merchant = @venue.merchant
      is_customer = false
    else
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
        @badges.each do |badge|
          badge.eager_load_type = BadgeType.id_to_type[badge_id_to_type_id[badge.id]]
        end
      end
      @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)  
      @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
    end
    @prizes_count = RedeemRewardRecord.count(RedeemRewardRecord.merchant.id => @venue.merchant.id, :mode => :prize, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :mode => :reward, :order => [:points.asc])
    @prizes = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :mode => :prize, :order => [:points.asc])
    if is_customer
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
    end
    render :template => '/api/v1/check_ins/create'
  end

  def find_closest
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    authorize! :read, Venue
    
    latitude = params[:latitude].to_f
    longitude = params[:longitude].to_f
    @venue = Venue.find_nearest(current_user, @merchant.id, latitude, longitude, 1).first
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id)
    @prizes_count = RedeemRewardRecord.count(RedeemRewardRecord.merchant.id => @merchant.id, :mode => :prize, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @badges = @venue.merchant.badges.sort_by { |b| b.rank }
    @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
    @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :mode => :reward, :order => [:points.asc])
    @prizes = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :mode => :prize, :order => [:points.asc])
    reward_id_to_subtype_id = {}
    reward_to_subtypes = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward => @rewards)
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
    render :template => '/api/v1/venues/find_closest'
  end
  
  def find_nearest
    authorize! :read, Venue

    merchant_id = params[:merchant_id]
    if merchant_id
      Merchant.get(merchant_id) || not_found
    end
    latitude = params[:latitude].to_f
    longitude = params[:longitude].to_f
    max = params[:limit].to_i
    @venues = Venue.find_nearest(current_user, merchant_id, latitude, longitude, max)
    render :template => '/api/v1/venues/find_nearest'
  end
  
  def share_photo
    authorize! :read, Venue
    
    if params[:image].blank?
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.photo_blank").split('\n') } }
      end
    else
      filename = "#{String.random_alphanumeric(32)}.jpg"
      AWS::S3::S3Object.store(
        ::Common.generate_temp_file_path(filename), 
        params[:image],
        APP_PROP["AMAZON_PHOTOS_BUCKET"], 
        :content_type => 'image/jpg', 
        :access => :public_read
      )
      @photo_url = ::Common.generate_full_temp_file_path(filename)
      @upload_token = String.random_alphanumeric
      session[:photo_upload_token] = @upload_token
      render :template => '/api/v1/venues/share_photo'
    end
  end  
end