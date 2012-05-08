class Api::V1::CheckInsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  
  def create
    if !APP_PROP["DEBUG_MODE"]
      if APP_PROP["SIMULATOR_MODE"]
        @venue = Venue.first(:offset => 0, :limit => 1)
      else
        checkInCode = CheckInCode.first(:auth_code => params[:auth_code])
        if checkInCode.nil?
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :message => [t("api.check_ins.invalid_code")] } }  
          end
          return
        end
        @venue = checkInCode.venue
      end  
    else
      if params[:venue_id]
        @venue = Venue.get(params[:venue_id])
      else
        @venue = Venue.first(:offset => 0, :limit => 1)
      end
    end  
    new_customer = false
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    if @customer.nil?
      @customer = Customer.create(@venue.merchant, current_user)
      new_customer = true
    end
    authorize! :update, @customer
    
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.out_of_distance")] } }
      end
      return
    end
    
    CheckIn.transaction do
      begin
        now = Time.now
        if new_customer
          challenge_type_id = ChallengeType.value_to_id["referral"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          if challenge
            referral_challenge = ReferralChallenge.first(ReferralChallenge.merchant.id => @venue.merchant.id, :ref_email => current_user.email)
            if referral_challenge
              referral_customer = Customer.first(Customer.merchant.id => @venue.merchant.id, :user_id => referral_challenge.user.id)
              referral_customer.points += challenge.points
              referral_customer.save
            end
          end
        end
        last_check_in = CheckIn.create(@venue, current_user, @customer)
        @winners_count = EarnPrize.count(EarnPrize.venue.id => @venue.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
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
            ::Common.get_eligible_reward_text((@customer.points - reward.points).abs)
          )
          @eligible_rewards << item  
        end
        render :template => '/api/v1/check_ins/create'
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.check_ins.create_failure")] } }
        end
      end
    end
  end
end