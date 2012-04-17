class Api::V1::CheckInsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  
  def create
    if !APP_PROP["DEBUG_MODE"]
      checkInCode = CheckInCode.first(:auth_code => params[:auth_code]) || not_found
      @venue = checkInCode.venue
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
        challenge = Challenge.first(:type => 'referral', :challenge_venues => { :venue_id => @venue.id })
        if challenge && new_customer
          referral_challenge = ReferralChallenge.first(ReferralChallenge.merchant.id => @venue.merchant.id, :ref_email => current_user.email)
          if referral_challenge
            referral_customer = Customer.first(Customer.merchant.id => @venue.merchant.id, :user_id => referral_challenge.user.id)
            referral_customer.points += challenge.points
            referral_customer.save
          end
        end
        last_check_in = CheckIn.create(@venue, current_user, @customer)
        @winners_count = EarnPrize.count(EarnPrize.merchant.id => @venue.merchant.id, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
        @rewards = CustomerReward.all(CustomerReward.merchant.id => @venue.merchant.id, :customer_reward_venues => { :venue_id => @venue.id }, :points.lte => @customer.points)
        @rewards.concat(CustomerReward.all(CustomerReward.merchant.id => @venue.merchant.id, :customer_reward_venues => { :venue_id => @venue.id }, :points.gt => @customer.points, :order => [:points.asc], :offset => 0, :limit => 1))
        @eligible_rewards = []
        @rewards.each do |reward|
          item = EligibleReward.new(
            reward.id,
            reward.type.value,
            reward.title,
            (@customer.points - reward.points).abs
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