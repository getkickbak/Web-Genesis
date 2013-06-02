class Api::V1::VenuesController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_explore, :merchant_add_sku_data, :share_photo]
  before_filter :authenticate_user!, :except => [:merchant_explore, :merchant_add_sku_data]
  skip_authorization_check :only => [:merchant_explore, :merchant_add_sku_data]
  
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
    @rewards = Common.get_rewards_by_venue(@venue, :reward)
    @prizes = Common.get_rewards_by_venue(@venue, :prize)
    @newsfeed = Common.get_news(@venue, @customer)
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
    @rewards = Common.get_rewards_by_venue(@venue, :reward)
    @prizes = Common.get_rewards_by_venue(@venue, :prize)
    if @venue.features_config.use_custom
      @features_config = @venue.features_config
    else
      @features_config = @merchant.features_config
    end
    render :template => '/api/v1/venues/merchant_explore'
  end

  def merchant_add_sku_data
    begin
      SkuRecord.transaction do
        if params[:venue_id]
          @venue = Venue.get(params[:venue_id])
          if @venue.nil?
            raise "No such venue: #{params[:venue_id]}"
          end
          data = params[:data] ? params[:data].split('$')[1] : params[:data]
        else
          data = params[:data]  
        end 
        cipher = Gibberish::AES.new(@venue.auth_code)
        decrypted = cipher.dec(data)
        now = Time.now
        receipts = JSON.parse(decrypted, { :symbolize_names => true })[:receipts] 
        txn_ids = []
        records = []
        receipts.each do |receipt|
          txn_ids << receipt[:txnId]
          receipt[:items].each do |item|
            records << { :txn_id => receipt[:txnId], :item => item }
          end
        end
        id_to_reward_record = {}
        reward_records = EarnRewardRecord.all(:id => txn_ids)
        reward_records.each do |record|
          id_to_reward_record[record.id] = record
        end
        records.each do |record|
          reward_record = id_to_reward_record[record[:txn_id]]
          sku_record = SkuRecord.new(
            :sku_id => record[:item][:name], 
            :venue_id => params[:venue_id], 
            :txn_id => record[:txn_id], 
            :price => record[:item][:price], 
            :quantity => record[:item][:qty]
          )
          sku_record[:created_ts] = now
          sku_record[:update_ts] = now
          sku_record.merchant = @venue.merchant
          sku_record.customer = reward_record.customer
          sku_record.user = reward_record.user
          sku_record.save
        end
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true } }
        end
      end
    rescue DataMapper::SaveFailureError => e  
      logger.error("Exception: " + e.resource.errors.inspect)  
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.venues.merchant_add_sku_data_failure").split(/\n/) } }
      end
      return
    rescue StandardError => e  
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.venues.merchant_add_sku_data_failure").split(/\n/) } }
      end
    end
  end
  
  def find_closest
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    authorize! :read, Venue

    if params[:latitude] && params[:longitude]
      latitude = params[:latitude].to_f
      longitude = params[:longitude].to_f
    else
      location_result = request.location
      if location_result
        latitude = location_result.latitude
        longitude = location_result.longitude
      else
        latitude = nil
        longitude = nil  
      end
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
    @rewards = Common.get_rewards_by_venue(@venue, :reward)
    @prizes = Common.get_rewards_by_venue(@venue, :prize)
    @newsfeed = Common.get_news(@venue, @customer)
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
      if location_result
        latitude = location_result.latitude
        longitude = location_result.longitude
      else
        latitude = nil
        longitude = nil  
      end
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