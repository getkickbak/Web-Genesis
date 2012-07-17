class Api::V1::ChallengesController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    authorize! :read, Challenge
    
    @challenges = Challenge.all(:challenge_venues => { :venue_id => params[:venue_id] })
    challenge_id_to_type_id = {}
    challenge_to_types = ChallengeToType.all(:fields => [:challenge_id, :challenge_type_id], :challenge => @challenges)
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
    @challenge = Challenge.first(:id => params[:id], Challenge.merchant.id => @venue.merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    begin
      Customer.transaction do
        if is_startable_challenge?
          start_challenge
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split('\n') } }
          end  
        end
      end    
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.start_failure").split('\n') } }
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
    if !Common.within_geo_distance?(current_user, params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.out_of_distance").split('\n') } }
      end
      return
    end

    if APP_PROP["SIMULATOR_MODE"]
      data = String.random_alphanumeric(32)
    else
      data = params[:data]
    end
    @data_expiry_ts = nil
    satisfied = false
    authorized = false
    @invalid_code = false
    begin
      if is_challenge_satisfied?
        satisfied = true
        if ((!@challenge.require_verif) || (@challenge.require_verif && authenticated?(data)))
          authorized = true
        end    
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), invalid authentication code")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.challenges.invalid_code").split('\n') } }
      end 
      return 
    end
      
    begin     
      Customer.transaction do
        if authorized
          @points = 0
          if points_eligible?
            if not challenge_limit_reached?
              @mutex = CacheMutex.new(@customer.cache_key, Cache.memcache)
              acquired = @mutex.acquire
              @customer.reload
              now = Time.now
              record = EarnRewardRecord.new(
                :challenge_id => @challenge.id,
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
                :type => :earn,
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
              @customer.save
              @rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => @venue.id }, :conditions => [ 'mode = ? OR mode = ?', CustomerReward::Modes.index(:reward_only)+1, CustomerReward::Modes.index(:prize_and_reward)+1], :order => [:points.asc]) + 
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
              reward_id_to_type_id = {}
              reward_to_types = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_type_id], :customer_reward => @rewards)
              reward_to_types.each do |reward_to_type|
                reward_id_to_type_id[reward_to_type.customer_reward_id] = reward_to_type.customer_reward_type_id
              end              
              @rewards.each do |reward|
                reward.eager_load_type = CustomerRewardType.id_to_type[reward_id_to_type_id[reward.id]]
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
              @points = @challenge.points
              render :template => '/api/v1/challenges/complete'
              logger.info("User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), #{@challenge.points} points awarded")
            else
              @msg = get_success_no_points_limit_reached_msg.split('\n')  
              render :template => '/api/v1/challenges/complete'
              logger.info("User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), no points awarded because limit reached")
            end
          else
            @msg = get_success_no_points_msg.split('\n')  
            render :template => '/api/v1/challenges/complete'
            logger.info("User(#{current_user.id}) successfully completed Challenge(#{@challenge.id}), no points awarded because it is not eligible")
          end
        else
          if satisfied && (not @invalid_code)
            msg = t("api.challenges.expired_code").split('\n')
            logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), authentication code expired")
          elsif @invalid_code
            msg = t("api.challenges.invalid_code").split('\n')
            logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), invalid authentication code")
          else  
            msg = t("api.challenges.missing_requirements").split('\n')
            logger.info("User(#{current_user.id}) failed to complete Challenge(#{@challenge.id}), missing requirements")
          end  
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => msg } }
          end 
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
    ensure
      @mutex.release if ((defined? @mutex) && !@mutex.nil?)    
    end    
  end
  
  def complete_referral
    data = params[:data].split('$')
    merchant = Merchant.get(data[0]) || not_found
    already_customer = false
    @customer = Customer.first(Customer.user.id => current_user.id, Customer.merchant.id => merchant.id)
    if @customer.nil?
      @customer = Customer.create(merchant, current_user)
    elsif @customer.visits > 0
      already_customer = true
    end
    authorize! :read, @customer
    
    logger.info("Complete Referral Challenge, Customer(#{@customer.id}), User(#{current_user.id})")
    authorized = false
    
    begin
      cipher = Gibberish::AES.new(@customer.merchant.auth_code)
      decrypted = cipher.dec(data[1])
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      referrer_id = decrypted_data["refr_id"]
      challenge_id = decrypted_data["chg_id"]
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted referrer_id: #{referrer_id}")
      #logger.debug("decrypted challenge_id: #{challenge_id}")
      #logger.debug("decrypted data: #{data[1]}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_EMAIL || decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_DIRECT}")
      #logger.debug("Challenge doesn't exists: #{Challenge.get(challenge_id).nil?}")
      #logger.debug("ReferralChallengeRecord doesn't exists: #{ReferralChallengeRecord.first(:referrer_id => referrer_id, :referral_id => @customer.id).nil?}")
      if (decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_EMAIL || decrypted_data["type"] == EncryptedDataType::REFERRAL_CHALLENGE_DIRECT) && (@challenge = Challenge.get(challenge_id)) 
        #logger.debug("Set authorized to true")
        authorized = true  
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      logger.info("Customer(#{@customer.id}) failed to complete Referral Challenge, invalid referral code")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.challenges.invalid_referral_code").split('\n') } }
      end  
      return
    end
    
    if already_customer
      if ReferralChallengeRecord.first(:referrer_id => referrer_id, :referral_id => @customer.id).nil?
        msg = t("api.challenges.already_customer").split('\n')
        logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{challenge_id}), already a customer")
      else
        referrer = Customer.get(referrer_id)
        msg = (t("api.challenges.already_referred").split('\n') % [referrer.user.name])
        logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{challenge_id}), already referred")
      end  
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => msg } }
      end  
      return
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
          render :template => '/api/v1/challenges/complete_referral'
          logger.info("User(#{current_user.id}) successfully completed Referral Challenge(#{@challenge.id})")
        else  
          logger.info("User(#{current_user.id}) failed to complete Referral Challenge(#{challenge.id}), invalid referral code")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.challenges.invalid_referral_code").split('\n') } }
          end      
        end      
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_referral_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.challenges.complete_referral_failure").split('\n') } }
      end  
    end      
  end
  
  private
  
  def authenticated?(data)
    if APP_PROP["SIMULATOR_MODE"]
      return true
    else
      #logger.debug("data: #{data}")
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      decrypted_data = JSON.parse(decrypted)
      @data_expiry_ts = Time.at(decrypted_data["expiry_ts"]/1000)
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted expiry_ts: #{@data_expiry_ts}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::EARN_POINTS}")
      #logger.debug("Time comparison: #{@data_expiry_ts >= Time.now}")
      #logger.debug("EarnRewardRecord comparison: #{EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => @data_expiry_ts, :data => data).nil?}")
      if decrypted_data["type"] == EncryptedDataType::EARN_POINTS 
        if (@data_expiry_ts >= Time.now) && EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => @data_expiry_ts, :data => data).nil?
          return true
        end  
      else
        @invalid_code = true
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
    elsif @challenge.type.value == "referral"
      return false  
    end
    return true
  end
  
  def points_eligible?
    if @challenge.type.value == "vip"
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
          @subject = t("mailer.email_subject_referral_challenge")
          @body = ReferralChallenge.new(current_user, @venue, @challenge).render_html
          render :template => '/api/v1/challenges/start'
          logger.info("User(#{current_user.id}) successfully created email referral in Customer Account(#{@customer.id})")
        else
          data = { 
            :type => EncryptedDataType::REFERRAL_CHALLENGE_DIRECT,
            :refr_id => @customer.id,
            :chg_id => @challenge.id
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
          format.json { render :json => { :success => false, :message => t("api.challenges.must_be_customer_to_refer").split('\n') } }
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
    case @challenge.type.value
    when "vip"
      visits = @customer.visits % @challenge.data.visits
      t("api.challenges.vip_success") % [visits, I18n.t('api.visit', :count => visits), @challenge.points]
    else
      t("api.challenges.unsupported_success")  
    end
  end
end