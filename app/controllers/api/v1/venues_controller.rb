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
      @customer.last_check_in = CheckIn.new
      @customer.merchant = @venue.merchant
      is_customer = false
    end
    @winners_count = EarnPrize.count(EarnPrize.merchant.id => @venue.merchant.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :conditions => [ 'mode = ? OR mode = ?', CustomerReward::Modes.index(:reward_only)+1, CustomerReward::Modes.index(:prize_and_reward)+1], :order => [:points.asc])
    if is_customer
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
      reward_id_to_subtype_id = {}
      reward_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward => @rewards)
      reward_to_subtypes.each do |reward_to_subtype|
        reward_id_to_subtype_id[reward_to_subtype.customer_reward_id] = reward_to_subtype.customer_reward_subtype_id
      end      
      @rewards.each do |reward|
        reward.eager_load_type = CustomerRewardSubtype.id_to_type[reward_id_to_subtype_id[reward.id]]
=begin        
        item = EligibleReward.new(
          reward.id,
          reward.eager_load_type.value,
          reward.title,
          ::Common.get_eligible_reward_text(@customer.points - reward.points)
        )
        @eligible_rewards << item
=end        
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
    @winners_count = EarnPrize.count(EarnPrize.merchant.id => @merchant.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :conditions => [ 'mode = ? OR mode = ?', CustomerReward::Modes.index(:reward_only)+1, CustomerReward::Modes.index(:prize_and_reward)+1], :order => [:points.asc])
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
    reward_id_to_subtype_id = {}
    reward_to_subtypes = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward => @rewards)
    reward_to_subtypes.each do |reward_to_subtype|
      reward_id_to_subtype_id[reward_to_subtype.customer_reward_id] = reward_to_subtype.customer_reward_subtype_id
    end    
    @rewards.each do |reward|
      reward.eager_load_type = CustomerRewardSubtype.id_to_type[reward_id_to_subtype_id[reward.id]]
=begin      
      item = EligibleReward.new(
        reward.id,
        reward.eager_load_type.value,
        reward.title,
        ::Common.get_eligible_reward_text(@customer.points - reward.points)
      )
      @eligible_rewards << item
=end      
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