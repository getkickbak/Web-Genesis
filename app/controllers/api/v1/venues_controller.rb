class Api::V1::VenuesController < ApplicationController
  skip_before_filter :verify_authenticity_token, :except => [:share_photo]
  before_filter :authenticate_user!
  
  def explore
    @venue = Venue.get(params[:id]) || not_found
     if @venue.status != :active
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split('\n') } }
      end
      return  
    end
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
      @badges = Common.populate_badges(@venue.merchant, request.env['HTTP_USER_AGENT'])
      @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)  
      @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
    end
    @prize_jackpots = EarnPrizeRecord.count(EarnPrizeRecord.merchant.id => @venue.merchant.id, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = Common.get_rewards(@venue, :reward)
    @prizes = Common.get_rewards(@venue, :prize)
    @newsfeed = Common.get_news(@venue)
    render :template => '/api/v1/check_ins/create'
  end

  def find_closest
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    authorize! :read, Venue
    
    latitude = params[:latitude].to_f
    longitude = params[:longitude].to_f
    @venue = Venue.find_nearest(current_user, @merchant.id, latitude, longitude, 1).first
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id)
    @prize_jackpots = EarnPrizeRecord.count(EarnPrizeRecord.merchant.id => @merchant.id, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @badges = Common.populate_badges(@venue.merchant, request.env['HTTP_USER_AGENT'])
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