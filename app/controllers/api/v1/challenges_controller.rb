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
        if is_startable_challenge?
          start_challenge
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => true } }
          end
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split('\n') } }
          end  
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split('\n') } }
        end
      end
    end  
  end
  
  def complete    
    @venue = Venue.get(params[:venue_id]) || not_found
    @challenge = Challenge.first(:id => params[:id], Challenge.merchant.id => @venue.merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    logger.info("Complete Challenge(#{@challenge.id}), Type(#{@challenge.type.value}), Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.out_of_distance").split('\n') } }
      end
      return
    end

    if APP_PROP["DEBUG_MODE"]
      data = String.random_alphanumeric(32)
    else
      data = params[:data]
    end
    @data_expiry_ts = nil
    authorized = false
    begin
      if is_challenge_satisfied? && ((!@challenge.require_verif) || (@challenge.require_verif && authenticated?(data)))
        authorized = true
      end
    rescue
      logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), invalid authentication code")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.challenges.invalid_code").split('\n') } }
      end  
    end
    
    Customer.transaction do
      begin
        if authorized
          if points_eligible?
            if not challenge_limit_reached?
              record = EarnRewardRecord.new(
                :challenge_id => @challenge.id,
                :venue_id => @venue.id,
                :data => data || "",
                :data_expiry_ts => @data_expiry_ts || ::Constant::MIN_TIME,
                :points => @challenge.points,
                :created_ts => Time.now
              )
              record.merchant = @venue.merchant
              record.user = current_user
              record.save
              @customer.points += @challenge.points
              @customer.save
              logger.info("User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), #{@challenge.points} awarded")
              respond_to do |format|
                #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                format.json { render :json => { :success => true, :metaData => { :account_points => @customer.points, :points => @challenge.points } } }
              end
            else
              logger.info("User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), no points awarded because limit reached")
              respond_to do |format|
                #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                format.json { render :json => { :success => true, :metaData => { :account_points => @customer.points, :points => 0, :message => get_success_no_points_limit_reached_msg.split('\n') } } }
              end  
            end
          else
            logger.info("User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), no points awarded because it is not eligible")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => true, :metaData => { :account_points => @customer.points, :points => 0, :mesage => get_success_no_points_msg.split('\n') } } }
            end  
          end
        else
          logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), authentication code expired")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.expired_code").split('\n') } }
          end 
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.challenges.complete_failure").split('\n') } }
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.challenges.complete_failure").split('\n') } }
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
      @data_expiry_ts = Time.at(decrypted_data["expiry_ts"]/1000)
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted expiry_ts: #{@data_expiry_ts}")
      #logger.debug("decrypted data: #{data}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::EARN_POINTS}")
      #logger.debug("Time comparison: #{@data_expiry_ts >= Time.now}")
      #logger.debug("EarnRewardRecord comparison: #{EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => @data_expiry_ts, :data => data).nil?}")
      if (decrypted_data["type"] == EncryptedDataType::EARN_POINTS) && (@data_expiry_ts >= Time.now) && EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => @data_expiry_ts, :data => data).nil?
        return true
      end
      return false
    end
  end
  
  def is_challenge_satisfied?
    if @challenge.type.value == "photo"
      if session[:photo_upload_token] == params[:upload_token]
        session.delete :photo_upload_token
        return true
      end
      return false
    end
    return true
  end
  
  def points_eligible?
    if @challenge.type == "referral" || @challenge.type == "vip"
      return false
    end 
    return true
  end
  
  def challenge_limit_reached?
    if @challenge.type.value == "photo"
      return EarnRewardRecord.count(:challenge_id => @challenge.id, :merchant => @challenge.merchant, :user => current_user, :created_ts.gte => Date.today.to_time) > 0
    elsif @challenge.type.value == "birthday"
      return EarnRewardRecord.count(:challenge_id => @challenge.id, :merchant => @challenge.merchant, :user => current_user, :created_ts.gte => 11.month.ago.to_time) > 0  
    end
    return false  
  end
  
  def is_startable_challenge?
    if @challenge.type.value == "referral"
      return true
    end
    return false
  end
  
  def start_challenge
    if @challenge.type.value == "referral"
      # Need to filter out which emails are already customers
      emails = JSON.parse(params[:emails])
      users = User.all(:fields => [:name, :email], :email => emails)
      emails_to_user = {}
      users.each do |user|
        emails_to_user[user.email] = user.name
      end
      emails.each do |email|
        ReferralChallenge.create(@venue.merchant, current_user, { :ref_email => email })
        
        # Send email notification to new customers (registered or non-registered users)
        UserMailer.referral_email(current_user, venue, email, emails_to_user[email])
      end
    end
  end
  
  def get_success_no_points_limit_reached_msg
    case @challenge.type.value
    when "photo"
      t("api.challenges.limit_reached_ok")
    when "birthday"
      t("api.challenges.limit_reached_invalid") % [1, I18n.t('api.time', :count => 1), I18n.t('api.year', :count => 1)]  
    else  
      t("api.challenges.limit_reached_ok")
    end
  end
  
  def get_success_no_points_msg
    case @challenge.type.value
    when "vip"
      visits = @customer.visits % @challenge.data.visits
      t("api.challenges.vip_success") % [visits, I18n.t('api.visit', :count => visits), @challenge.points]
    else
      t("api.challenges.unsupported_success")  
    end
  end
end