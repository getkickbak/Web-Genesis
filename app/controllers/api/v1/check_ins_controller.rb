class Api::V1::CheckInsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  
  def create
    if !APP_PROP["DEBUG_MODE"] && !APP_PROP["SIMULATOR_MODE"]
      begin
        encrypted_data = params[:auth_code].split('$')
        venue = Venue.get(encrypted_data[0])
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
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.out_of_distance").split('\n') } }
      end
      return
    end
    
    begin
      CheckIn.transaction do
        now = Time.now
        last_check_in = CheckIn.create(@venue, current_user, @customer)
        @winners_count = EarnPrize.count(EarnPrize.merchant.id => @venue.merchant.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
        @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :order => [:points.asc])
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
        @rewards.each do |reward|
          item = EligibleReward.new(
            reward.id,
            reward.type.value,
            reward.title,
            ::Common.get_eligible_reward_text(@customer.points - reward.points)
          )
          @eligible_rewards << item  
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