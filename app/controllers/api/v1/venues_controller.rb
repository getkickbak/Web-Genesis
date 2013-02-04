class Api::V1::VenuesController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_explore, :share_photo]
  before_filter :authenticate_user!, :except => [:merchant_explore]
  skip_authorization_check :only => [:merchant_explore]
  
  def explore
    @venue = Venue.get(params[:id]) || not_found
    authorize! :read, @venue

    if @venue.status != :active
      respond_to do |format|
      #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split(/\n/) } }
      end
      return
    end

    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user)
    if @customer.nil?
      @customer = Customer.new
      @customer.id = 0
      @customer.points = 0
      @customer.prize_points = 0
      @customer.last_check_in = CheckIn.new
      @customer.merchant = @venue.merchant
    else
      @badges = Common.populate_badges(@venue.merchant, session[:user_agent] || :iphone, session[:resolution] || :mxhdpi)
      if @customer.badge_reset_ts <= @venue.merchant.badges_update_ts
        @customer.badge, @customer.next_badge_visits = Common.find_badge(@badges.to_a, @customer.visits)
        @customer.badge_reset_ts = Time.now
        @customer.save
      end
      @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
      @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
    end
    @prize_jackpots = EarnPrizeRecord.count(:merchant => @venue.merchant, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = Common.get_rewards(@venue, :reward)
    @prizes = Common.get_rewards(@venue, :prize)
    @newsfeed = Common.get_news(@venue)
    render :template => '/api/v1/check_ins/create'
  end

  def merchant_explore
    @venue = Venue.get(params[:id]) || not_found

    if @venue.status != :active
      respond_to do |format|
      #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split(/\n/) } }
      end
      return
    end

    @prize_jackpots = EarnPrizeRecord.count(:merchant => @venue.merchant, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = Common.get_rewards(@venue, :reward)
    @prizes = Common.get_rewards(@venue, :prize)
    @newsfeed = Common.get_news(@venue)
    render :template => '/api/v1/venues/merchant_explore'
  end

  def find_closest
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    authorize! :read, Venue

    if params[:latitude] && params[:longitude]
      latitude = params[:latitude].to_f
      longitude = params[:longitude].to_f
    else
      location_result = request.location
      latitude = location_result.latitude
      longitude = location_result.longitude
    end
    @venue = Venue.find_nearest(current_user, @merchant.id, latitude, longitude, 1).first
    @customer = Customer.first(:merchant => @merchant, :user => current_user)
    @prize_jackpots = EarnPrizeRecord.count(:merchant => @merchant, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @badges = Common.populate_badges(@venue.merchant, session[:user_agent] || :iphone, session[:resolution] || :mxhdpi)
    if @customer.badge_reset_ts <= @venue.merchant.badges_update_ts
      @customer.badge, @customer.next_badge_visits = Common.find_badge(@badges.to_a, @customer.visits)
      @customer.badge_reset_ts = Time.now
      @customer.save
    end
    @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
    @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
    @rewards = Common.get_rewards(@venue, :reward)
    @prizes = Common.get_rewards(@venue, :prize)
    @newsfeed = Common.get_news(@venue)
    render :template => '/api/v1/venues/find_closest'
  end

  def find_nearest
    authorize! :read, Venue

    merchant_id = params[:merchant_id]
    if merchant_id
      Merchant.get(merchant_id) || not_found
    end
    if params[:latitude] && params[:longitude]
      latitude = params[:latitude].to_f
      longitude = params[:longitude].to_f
    else
      location_result = request.location
      if location_result == nil
        logger.info("No geolocation found!")
      end
      latitude = location_result.latitude
      longitude = location_result.longitude
    end
    max = params[:limit].to_i
    @venues = Venue.find_nearest(current_user, merchant_id, latitude, longitude, max)
    render :template => '/api/v1/venues/find_nearest'
  end

  def share_photo
    authorize! :read, Venue

    if params[:image].blank?
      respond_to do |format|
      #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.photo_blank").split(/\n/) } }
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