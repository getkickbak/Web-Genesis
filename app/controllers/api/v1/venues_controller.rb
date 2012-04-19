class Api::V1::VenuesController < ApplicationController
  skip_before_filter :verify_authenticity_token  
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
      @customer.last_check_in = CheckIn.new
      @customer.merchant = @venue.merchant
      is_customer = false
    end
    if is_customer
      @winners_count = EarnPrize.count(EarnPrize.merchant.id => @venue.merchant.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
      @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :points.lte => @customer.points)
      n = CustomerReward.count(:customer_reward_venues => { :venue_id => @venue.id }) - @rewards.length
      if n > 0
        @rewards.concat(CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :points.gt => @customer.points, :order => [:points.asc], :offset => 0, :limit => n))
      end
      @eligible_rewards = []
      @rewards.each do |reward|
        item = EligibleReward.new(
          reward.id,
          reward.type.value,
          reward.title,
          ::Common.get_reward_text((@customer.points - reward.points).abs)
        )
        @eligible_rewards << item
      end 
    end
    render :template => '/api/v1/check_ins/create'
  end

  def find_closest
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    authorize! :read, Venue
    
    latitude = params[:latitude].to_f
    longitude = params[:longitude].to_f
    @venue = Venue.find_nearest(@merchant.id, latitude, longitude, 1).first
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id)
    @winners_count = EarnPrize.count(EarnPrize.merchant.id => @merchant.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :points.lte => @customer.points)
    n = CustomerReward.count(:customer_reward_venues => { :venue_id => @venue.id }) - @rewards.length
    if n > 0
      @rewards.concat(CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :points.gt => @customer.points, :order => [:points.asc], :offset => 0, :limit => n))
    end
    @eligible_rewards = []
    @rewards.each do |reward|
      item = EligibleReward.new(
        reward.id,
        reward.type.value,
        reward.title,
        ::Common.get_reward_text((@customer.points - reward.points).abs)
      )
      @eligible_rewards << item
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
    @venues = Venue.find_nearest(merchant_id, latitude, longitude, max)
    render :template => '/api/v1/venues/find_nearest'
  end
  
  def share_photo
    authorize! :read, Venue
    
    if params[:image].blank?
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => [t("api.photo_blank")] } }
      end
    else
      filename = "#{String.random_alphanumeric}.jpg"
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