class Api::V1::ChallengesController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_complete]
  before_filter :authenticate_user!, :except => [:merchant_complete]
  skip_authorization_check :only => [:merchant_complete]
  
  def index
    @venue = Venue.get(params[:venue_id]) || not_found
    authorize! :read, @venue
    
    challenge_venues = ChallengeVenue.all(:fields => [:challenge_id], :venue_id => @venue.id)
    challenge_ids = []
    challenge_venues.each do |challenge_venue|
      challenge_ids << challenge_venue.challenge_id
    end
    @challenges = Challenge.all(:id => challenge_ids)
    challenge_id_to_type_id = {}
    challenge_to_types = ChallengeToType.all(:fields => [:challenge_id, :challenge_type_id], :challenge_id => challenge_ids)
    challenge_to_types.each do |challenge_to_type|
      challenge_id_to_type_id[challenge_to_type.challenge_id] = challenge_to_type.challenge_type_id
    end
    @challenges.each do |challenge|
      challenge.eager_load_type = ChallengeType.id_to_type[challenge_id_to_type_id[challenge.id]]
    end
    render :template => '/api/v1/challenges/index'
  end

  def start
    @venue = Venue.get(params[:venue_id]) || not_found
    @challenge = Challenge.first(:id => params[:id], :merchant => @venue.merchant) || not_found
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user) || not_found
    authorize! :update, @customer
    
    logger.info("Start Challenge(#{@challenge.id}), Type(#{@challenge.type.value}), Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")
    
    if @venue.status != :active
      logger.info("User(#{current_user.id}) failed to start Challenge(#{@challenge.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split(/\n/) } }
      end
      return  
    end
    
    begin
      Customer.transaction do
        if is_startable_challenge?
          start_challenge
        else
          logger.info("User(#{current_user.id}) failed to start Challenge(#{@challenge.id}), not startable")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split(/\n/) } }
          end  
        end
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split(/\n/) } }
      end  
    end
  end
  
  def merchant_complete
    begin      
      encrypted_data = params[:data].split('$')
      if encrypted_data.length != 2
        raise "Invalid authorization code format"
      end
      @venue = Venue.get(encrypted_data[0])
      if @venue.nil?
        raise "No such venue: #{encrypted_data[0]}"
      end
      data = encrypted_data[1]
      #logger.debug("data: #{data}")
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      data_expiry_ts = Time.at(decrypted_data["expiry_ts"]/1000)  
      # Cache expires in 12 hrs
      if decrypted_data["type"] == EncryptedDataType::EARN_POINTS 
        if (data_expiry_ts >= Time.now) && EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => data_expiry_ts, :data => data).nil? 
          if params[:frequency]
            frequency = JSON.parse(params[:frequency])
          else
            frequency = decrypted_data["frequency"]
          end
          channel_group = Channel.get_group(encrypted_data[0])
          request_data = { 
            :data => params[:data],
            :venue_id => @venue.id
          }.to_json
          request_info = {
            :type => RequestType::EARN_POINTS,
            :frequency1 => frequency[0],
            :frequency2 => frequency[1],
            :frequency3 => frequency[2],
            :latitude => @venue.latitude,
            :longitude => @venue.longitude,
            :data => request_data,
            :channel_group => channel_group,
            :channel => Channel.reserve(channel_group)
          }
          @request = Request.create(request_info)
        else
          raise "Authorization code expired"            
        end
      else
        raise "Authorization code not valid"
      end    
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_request_failure").split(/\n/) } }
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_request_failure").split(/\n/) } }
      end
      return
    end
    
    if (response = @request.is_status?(:complete))[:result]
      logger.info("Venue(#{@venue.id}) successfully completed Request(#{@request.id})")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => true } }
      end
    else
      logger.info("Venue(#{@venue.id}) failed to complete Request(#{@request.id})")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_request_failure").split(/\n/) } }
      end
    end
    @request.destroy if Rails.env == "production"
  end
  
  def complete
    @venue = Venue.get(params[:venue_id]) || not_found
    @challenge = Challenge.first(:id => params[:id], :merchant => @venue.merchant) || not_found
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user) || not_found
    authorize! :update, @customer
    
    logger.info("Complete Challenge(#{@challenge.id}), Type(#{@challenge.type.value}), Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{current_user.id})")

    if @venue.status != :active
      logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split(/\n/) } }
      end
      return  
    end

    satisfied = false
    begin
      if APP_PROP["SIMULATOR_MODE"]
        data = String.random_alphanumeric(32)
      else
        if params[:frequency].nil?
          cipher = Gibberish::AES.new(form_authenticity_token)
          decrypted = cipher.dec(params[:data].split('$')[1])
          frequency = JSON.parse(decrypted)["frequency"]
        else
          frequency = JSON.parse(params[:frequency])  
        end
        if frequency
          request_info = {
            :type => RequestType::EARN_POINTS,
            :frequency1 => frequency[0],
            :frequency2 => frequency[1],
            :frequency3 => frequency[2],
            :latitude => @venue.latitude,
            :longitude => @venue.longitude
          }  
          @request = Request.match(request_info, current_user)
          if @request.nil?
            raise "No matching challenge complete request"
          end
          decrypted_data = JSON.parse(@request.data)
          if @venue.id != decrypted_data["venue_id"] 
            Request.set_status(@request, :failed)
            logger.error("Mismatch venue information, venue id:#{@venue.id}, merchant venue id:#{decrypted_data["venue_id"]}")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.challenges.venue_mismatch").split(/\n/) } }
            end
            return
          end
          data = decrypted_data["data"]
        else
          data = params[:data] 
        end  
      end
      if is_challenge_satisfied?
        satisfied = true  
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_failure").split(/\n/) } }
      end 
      return 
    end
      
    Time.zone = @venue.time_zone  
    begin     
      Customer.transaction do
        if satisfied
          @mutex = CacheMutex.new(@customer.mutex_key, Cache.memcache)
          acquired = @mutex.acquire
          @customer.reload
          @account_info = { :points => @customer.points }
          @reward_info = { :points => 0 }
          if points_eligible?
            if not challenge_limit_reached?
              now = Time.now
              record = EarnRewardRecord.new(
                :type => :challenge,
                :ref_id => @challenge.id,
                :venue_id => @venue.id,
                :data => data || "",
                :data_expiry_ts => @data_expiry_ts || ::Constant::MIN_TIME,
                :points => @challenge.points,
                :created_ts => now,
                :update_ts => now
              )
              record.merchant = @venue.merchant
              record.customer = @customer
              record.user = current_user
              record.save
              trans_record = TransactionRecord.new(
                :type => :earn_points,
                :ref_id => record.id,
                :description => @challenge.name,
                :points => @challenge.points,
                :created_ts => now,
                :update_ts => now
              )
              trans_record.merchant = @venue.merchant
              trans_record.customer = @customer
              trans_record.user = current_user
              trans_record.save
              @customer.points += @challenge.points
              @account_info[:points] = @customer.points
              @reward_info[:points] = @challenge.points
              rewards = @venue.customer_rewards.all(:mode => :reward, :order => [ :points.asc ])
              eligible_for_reward = !Common.find_eligible_reward(rewards.to_a, @customer.points).nil?
              @customer.eligible_for_reward = eligible_for_reward
              @customer.update_ts = now
              @customer.save
              @account_info[:eligible_for_reward] = eligible_for_reward
              log_msg = "User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), #{@challenge.points} points awarded"
            else
              @account_info[:eligible_for_reward] = @customer.eligible_for_reward
              @msg = get_success_no_points_limit_reached_msg.split(/\n/)  
              log_msg = "User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), no points awarded because limit reached"
            end
          else
            @msg = get_success_no_points_msg.split(/\n/)  
            log_msg = "User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), no points awarded because it is not eligible"
          end
          Request.set_status(@request, :complete)
          render :template => '/api/v1/challenges/complete'
          logger.info(log_msg)
        else
          Request.set_status(@request, :failed)  
          logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), missing requirements")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.missing_requirements").split(/\n/) } }
          end 
        end
      end
    rescue DataMapper::SaveFailureError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_failure").split(/\n/) } }
      end  
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_failure").split(/\n/) } }
      end
    ensure
      @mutex.release if ((defined? @mutex) && !@mutex.nil?)    
    end    
  end
  
  def complete_referral
    authorize! :read, Customer
        
    already_customer = false
    authorized = false
    
    begin
      data = params[:data] 
      encrypted_data = data.split('$')
      if encrypted_data.length != 2
        raise "Invalid referral code format"
      end
      merchant = Merchant.get(encrypted_data[0]) 
      if merchant.nil?
        raise "No such merchant: #{encrypted_data[0]}"
      end
      data = encrypted_data[1] 
      #logger.debug("data: #{data}")
      cipher = Gibberish::AES.new(@customer.merchant.auth_code)
      decrypted = cipher.dec(data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      if params[:frequency] || decrypted_data["frequency"]
        if params[:frequency]
          frequency = JSON.parse(params[:frequency])
        else  
          frequency = decrypted_data["frequency"]
        end
        request_info = {
          :type => RequestType::REFERRAL,
          :frequency1 => frequency[0],
          :frequency2 => frequency[1],
          :frequency3 => frequency[2],
          :latitude => params[:latitude],
          :longitude => params[:longitude]
        }
        @request = Request.match(request_info)
        if @request.nil?
          raise "No matching referral request"
        end
        decrypted_data = JSON.parse(@request.data)
        merchant = Merchant.get(decrypted_data["merchant_id"])
        if merchant.nil?
          raise "No such merchant: #{decrypted_data["merchant_id"]}"
        end
      end
      
      if merchant.status != :active
        Request.set_status(@request, :failed)
        logger.info("User(#{current_user.id}) failed to complete referral challenge at Merchant(#{merchant.id}), merchant is not active")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.inactive_merchant").split(/\n/) } }
        end
        return  
      end
    
      @customer = Customer.first(:user => current_user, :merchant => merchant)
      if @customer.nil?
        if (merchant.role == "merchant" && current_user.role == "user") || (merchant.role == "test" && current_user.role == "test") || current_user.role == "admin" || current_user.role == "anonymous"
          @customer = Customer.create(merchant, current_user)
        else
          Request.set_status(@request, :failed)
          logger.info("User(#{current_user.id}) failed to complete referral challenge at Merchant(#{merchant.id}), account not compatible with merchant")
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split(/\n/) } }
          end
          return
        end  
      elsif @customer.visits > 1
        already_customer = true
      end
      
      referrer_id = decrypted_data["refr_id"]
      challenge_id = decrypted_data["chg_id"]
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted referrer_id: #{referrer_id}")
      #logger.debug("decrypted challenge_id: #{challenge_id}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_EMAIL || decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_DIRECT}")
      #logger.debug("Challenge doesn't exists: #{Challenge.get(challenge_id).nil?}")
      #logger.debug("ReferralChallengeRecord doesn't exists: #{ReferralChallengeRecord.first(:referrer_id => referrer_id, :referral_id => @customer.id).nil?}")
      if (decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_EMAIL || decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_DIRECT) && (@challenge = Challenge.get(challenge_id)) 
        #logger.debug("Set authorized to true")
        authorized = true  
      end  
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message) 
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.challenges.invalid_referral_code").split(/\n/) } }
      end  
      return
    end
    
    logger.info("Complete Referral Challenge, Merchant(#{merchant.id}), Customer(#{@customer.id}), User(#{current_user.id})")

    if already_customer || (referrer_id == @customer.id)
      Request.set_status(@request, :failed)
      if ReferralChallengeRecord.first(:referrer_id => referrer_id, :referral_id => @customer.id).nil?
        msg = t("api.challenges.already_customer").split(/\n/)
        logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{challenge_id}), already a customer")
      else
        msg = t("api.challenges.already_referred").split(/\n/)
        logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{challenge_id}), already referred")
      end  
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => msg } }
      end  
      return
    else
      if ReferralChallengeRecord.first(:referral_id => @customer.id)
        Request.set_status(@request, :failed)
        msg = t("api.challenges.already_referred").split(/\n/)
        logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{challenge_id}), already referred")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => msg } }
        end 
        return
      end
    end
    
    begin
      Customer.transaction do
        if authorized
          now = Time.now
          record = ReferralChallengeRecord.create(
            :referrer_id => referrer_id,
            :referral_id => @customer.id,
            :points => @challenge.points,
            :referral_points => @challenge.data.referral_points,
            :created_ts => now,
            :update_ts => now
          )
          Request.set_status(@request, :complete)
          render :template => '/api/v1/challenges/complete_referral'
          logger.info("User(#{current_user.id}) successfully completed Referral Challenge(#{@challenge.id})")
        else  
          Request.set_status(@request, :failed)
          logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{@challenge.id}), invalid referral code")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.invalid_referral_code").split(/\n/) } }
          end      
        end      
      end
    rescue DataMapper::SaveFailureError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_referral_failure").split(/\n/) } }
      end
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_referral_failure").split(/\n/) } }
      end  
    end      
  end
  
  private
  
  def is_challenge_satisfied?
    if @challenge.type.value == "photo"
      if session[:photo_upload_token] == params[:upload_token]
        session.delete :photo_upload_token
        return true
      end
      logger.info("Invalid photo upload token: Real(#{session[:photo_upload_token]}), Passed(#{params[:upload_token]})")
      return false
    elsif @challenge.type.value == "referral" || @challenge.type.value == "birthday"
      return false
    end
    return true
  end
  
  def points_eligible? 
    return true
  end
  
  def challenge_limit_reached?
    if @challenge.type.value == "photo"
      return EarnRewardRecord.count(:type => :challenge, :ref_id => @challenge.id, :merchant => @challenge.merchant, :user => current_user, :created_ts.gte => Date.today.to_time) > 0  
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
      if @customer.visits > 0     
        @type = params[:type]
        if @type == "email"
          data = { 
            :type => EncryptedDataType::REFERRAL_CHALLENGE_EMAIL,
            :refr_id => @customer.id,
            :chg_id => @challenge.id
          }.to_json
          cipher = Gibberish::AES.new(@venue.merchant.auth_code)
          @encrypted_data = "#{@venue.merchant.id}$#{cipher.enc(data)}"
          @subject = t("mailer.email_subject_referral_challenge") % [@venue.name]
          referral_challenge = ReferralChallenge.new(current_user, @venue, @challenge)
          case session[:user_agent]
          when :iphone
            @body = referral_challenge.render_html
          when :android
            @body = referral_challenge.render_simple_html
          end    
          render :template => '/api/v1/challenges/start'
          logger.info("User(#{current_user.id}) successfully created email referral in Customer Account(#{@customer.id})")
        else
          data = { 
            :type => EncryptedDataType::REFERRAL_CHALLENGE_DIRECT,
            :refr_id => @customer.id,
            :chg_id => @challenge.id,
            :merchant_id => @venue.merchant.id
          }.to_json
          cipher = Gibberish::AES.new(@venue.merchant.auth_code)
          @encrypted_data = "#{@venue.merchant.id}$#{cipher.enc(data)}"    
          render :template => '/api/v1/challenges/start'
          logger.info("User(#{current_user.id}) successfully created direct referral in Customer Account(#{@customer.id})")
        end
      else
        logger.info("User(#{current_user.id}) failed to create referral in Customer Account(#{@customer.id}), not a customer")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.challenges.must_be_customer_to_refer").split(/\n/) } }
        end
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
    t("api.challenges.unsupported_success")  
  end
end