class Api::V1::ChallengesController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  
  def index
    authorize! :read, Challenge
    
    @challenges = Challenge.all(:challenge_venues => { :venue_id => params[:venue_id] })
    render :template => '/api/v1/challenges/index'
  end

  def start
    @venue = Veie.get(params[:venue_id]) || not_found
    @challenge = Challenge.first(:id => params[:id], Challenge.merchant.id => @venue.merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Time.zone = @venue.time_zone
    Customer.transaction do
      begin
        if is_startable_challenge?(@challenge)
          start_challenge(@venue)
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
    
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.out_of_distance")] } }
      end
      return
    end

    Customer.transaction do
      begin
        if APP_PROP["DEBUG_MODE"]
          data = String.random_alphanumeric(32)
        else
          data = params[:data]
        end
        if is_challenge_satisfied?(@challenge) && ((!@challenge.require_verif) || (@challenge.require_verif && authenticated?(data)))
          if not challenge_limit_reached?(@challenge)
            record = EarnRewardRecord.new(
              :challenge_id => @challenge.id,
              :venue_id => @venue.id,
              :data => data,
              :data_expiry_ts => @data_expiry_ts,
              :points => @challenge.points,
              :created_ts => Time.now
            )
            record.merchant = @venue.merchant
            record.user = current_user
            record.save
            @customer.points += @challenge.points
            @customer.save
          end
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
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.challenges.complete_failure")] } }
        end  
      end
    end
  end
  
  private
  
  def authenticated?(data)
    if APP_PROP["DEBUG_MODE"]
      return true
    else
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      decrypted_data = JSON.parse(decrypted)
      @data_expiry_ts = Time.parse(decrypted_data[:expiry_ts])
      if ((decrypted_data[:type] == EncryptedDataType::EARN_POINTS) && @data_expiry_ts >= Time.now) && EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => @data_expiry_ts, :data => data).nil?
        return true
      end
      return false
    end
  end
  
  def is_challenge_satisfied?(challenge)
    if challenge.type.value == "photo"
      if session[:photo_upload_token] == params[:upload_token]
        session.delete :photo_upload_token
        return true
      end
      return false
    elsif challenge.type.value == "vip"
      return false  
    end
    return true
  end
  
  def challenge_limit_reached?(challenge)
    if challenge.type.value == "photo"
      return EarnRewardRecord.count(:challenge_id => challenge.id, :merchant => challenge.merchant, :user => current_user, :created_ts.gte => Date.today.to_time) > 0
    end
    return false  
  end
  
  def is_startable_challenge?(challenge)
    if challenge.type.value == "referral"
      return true
    end
    return false
  end
  
  def start_challenge(venue)
    if challenge.type.value == "referral"
      # Need to filter out which emails are already customers
      emails = JSON.parse(params[:emails])
      users = User.all(:fields => [:name, :email], :email => emails)
      emails_to_user = {}
      users.each do |user|
        emails_to_user[user.email] = user.name
      end
      emails.each do |email|
        ReferralChallenge.create(venue.merchant, current_user, { :ref_email => email })
        
        # Send email notification to new customers (registered or non-registered users)
        UserMailer.referral_email(current_user, venue, email, emails_to_user[email])
      end
    end
  end
end