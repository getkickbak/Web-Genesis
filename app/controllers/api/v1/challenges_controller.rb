class Api::V1::ChallengesController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  
  def index
    authorize! :read, Challenge
    
    @challenges = Challenge.all(:challenge_venues => { :venue_id => params[:venue_id] })
    render :template => '/api/v1/challenges/index'
  end

  def start
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    @challenge = Challenge.first(:id => params[:id], Challenge.merchant.id => @merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        if is_startable_challenge?(@challenge)
          start_challenge(@merchant, current_user)
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => true } }
          end
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [t("api.challenges.start_failure")] } }
          end  
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.challenges.start_failure")] } }
        end
      end
    end  
  end
  
  def complete    
    @venue = Venue.get(params[:venue_id]) || not_found
    @challenge = Challenge.first(:id => params[:id], Challenge.merchant.id => @venue.merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.out_of_distance")] } }
      end
      return
    end

    Customer.transaction do
      begin
        if is_challenge_satisfied(@challenge) && ((!@challenge.require_verif) || (@challenge.require_verif && (@venue.authorization_codes.first(:auth_code => params[:auth_code]) || APP_PROP["DEBUG_MODE"])))
          record = EarnRewardRecord.new(
            :challenge_id => @challenge.id,
            :venue_id => @venue.id,
            :points => @challenge.points,
            :created_ts => Time.now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          @customer.points += @challenge.points
          @customer.save
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => true, :metaData => { :account_points => @customer.points, :points => @challenge.points } } }
          end
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [t("api.challenges.complete_failure")] } }
          end 
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.challenges.complete_failure")] } }
        end
      end
    end
  end
  
  protected
  
  def is_challenge_satisfied(challenge)
    if challenge.type.value == "photo"
      if session[:photo_upload_token] == params[:upload_token]
        session.delete :photo_upload_token
        return true
      end
      return false
    end
    return true
  end
  
  def is_startable_challenge?(challenge)
    if challenge.type.value == "referral"
      return true
    end
    return false
  end
  
  def start_challenge(merchant, user)
    if challenge.type.value == "referral"
      # Need to filter out which emails are already customers
      # TBD
      params[:emails].each do |email|
        ReferralChallenge.create(merchant, user, { :ref_email => email })
      end
      # Send email notification to new customers (registered or non-registered users)
      # TBD
    end
  end
end