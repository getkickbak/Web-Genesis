class Api::V1::PurchaseRewardsController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:merchant_earn]
  before_filter :authenticate_user!, :except => [:merchant_earn]
  skip_authorization_check :only => [:merchant_earn]
  
  def earn
    authorize! :update, Customer

    if not APP_PROP["SIMULATOR_MODE"]
      begin
        if params[:venue_id]
          @venue = Venue.get(params[:venue_id])
          if @venue.nil?
            raise "No such venue: #{params[:venue_id]}"
          end
          data = params[:data] ? params[:data].split('$')[1] : params[:data]
        else
          data = params[:data]  
        end  
        if params[:frequency]
          frequency = JSON.parse(params[:frequency], { :symbolize_names => true })
        else
          cipher = Gibberish::AES.new(form_authenticity_token)
          decrypted = cipher.dec(data)
          frequency = JSON.parse(decrypted, { :symbolize_names => true })[:frequency]
        end
        request_info = {
          :type => RequestType::EARN_POINTS,
          :frequency1 => frequency[0],
          :frequency2 => frequency[1],
          :frequency3 => frequency[2],
          :latitude => params[:latitude] || @venue.latitude,
          :longitude => params[:longitude] || @venue.longitude
        }  
        # Performance Test
        start_time = Time.now
        logger.info("Earn Request Match Starts at #{start_time.strftime("%a %m/%d/%y %H:%M:%S:%L %Z")}")
        @request = Request.match(request_info, current_user)
        end_time = Time.now
        logger.info("Earn Request Match Finished at #{end_time.strftime("%a %m/%d/%y %H:%M:%S:%L %Z")}")
        logger.info("Performance Test: Earn Request Match #{end_time - start_time} secs")
        # end
        if @request.nil?
          logger.info("No matching earn points request")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
          end
          return
        end  
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
        end
        return
      end
    end
      
    # Performance Test
    start_time = Time.now  
    earn_common
    end_time = Time.now
    logger.info("Performance Test: Earn Common #{end_time - start_time} secs")
    # end
  end
  
  def merchant_earn
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
      @decrypted_data = JSON.parse(decrypted, { :symbolize_names => true }) 
      expiry_ts_secs = @decrypted_data[:expiry_ts]/1000
      data_expiry_ts = Time.at(expiry_ts_secs)  
      if @decrypted_data[:type] == EncryptedDataType::EARN_POINTS
        # Cache expires in 12 hrs
        if (data_expiry_ts >= Time.now) && EarnRewardRecord.first(:venue_id => @venue.id, :data_expiry_ts => data_expiry_ts, :data => data).nil?
          reward_model_type = @venue.merchant.reward_model.type
          if reward_model_type.value == "amount_spent"
            amount = @decrypted_data[:amount].to_f
            if amount < 1.00
              raise "Amount must be >= 1.00"  
            end
            request_data = { 
              :amount => amount,
              :data => params[:data],
              :venue_id => @venue.id
            }.to_json
          else
            points = @decrypted_data[:points]
            if points == 0
              raise "Points must be >= 1"
            end
            request_data = { 
              :points => points,
              :data => params[:data],
              :venue_id => @venue.id
            }.to_json
          end  
          if params[:frequency] || @decrypted_data[:frequency]
            if params[:frequency]
              frequency = JSON.parse(params[:frequency], { :symbolize_names => true })
            else
              frequency = @decrypted_data[:frequency]
            end
            channel_group = Channel.get_group(params[:venue_id])
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
            logger.info("Merchant Earn Request Create Finished at #{Time.now.strftime("%a %m/%d/%y %H:%M:%S:%L %Z")}")
          end
        else
          raise "Authorization code expired"  
        end  
      else
        raise "Authorization code not valid"
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
      end
      return
    end
    
    if params[:frequency] || @decrypted_data[:frequency]
      # Performance Test
      start_time = Time.now
      logger.info("Merchant Earn Request Wait Starts at #{start_time.strftime("%a %m/%d/%y %H:%M:%S:%L %Z")}")
      if (response = @request.is_status?(:complete))[:result]
        logger.info("Venue(#{@venue.id}) successfully completed Request(#{@request.id})")
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true } }
        end  
      else
        logger.info("Venue(#{@venue.id}) failed to complete Request(#{@request.id})")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
        end
      end
      end_time = Time.now
      logger.info("Performance Test: Merchant Earn Request Wait #{end_time - start_time} secs")
      # end
      @request.destroy if Rails.env == "production"
    else
      # Performance Test
      start_time = Time.now
      earn_common
      end_time = Time.now
      logger.info("Performance Test: Merchant Earn Common #{end_time - start_time} secs")
      # end
    end      
  end
  
  private

  def earn_common
    # Performance Test
    start_time = Time.now
    @venue_id = params[:venue_id]
    if signed_in? && APP_PROP["SIMULATOR_MODE"]
      if @venue_id.nil?
        @venue = Venue.first(:offset => 0, :limit => 1)
      else
        @venue = Venue.get(@venue_id) || not_found
      end
      data = String.random_alphanumeric(32)
      data_expiry_ts = Time.now
      reward_model_type = @venue.merchant.reward_model.type
      if reward_model_type.value == "amount_spent"
        amount = Random.rand(100)+1
      else
        amount = 0.00
        points = Random.rand(10)+1
      end  
    else
      normal_exit = false
      begin
        User.transaction do
          if signed_in?
            @decrypted_data = JSON.parse(@request.data, { :symbolize_names => true })
            data = @decrypted_data[:data]
            @venue = Venue.get(@decrypted_data[:venue_id])
            if @venue.nil?
              raise "No such venue: #{@decrypted_data[:venue_id]}"
            end
            reward_model_type = @venue.merchant.reward_model.type 
          else
            data = params[:data]
            reward_model_type = @venue.merchant.reward_model.type
          end
          
          if reward_model_type.value == "amount_spent"
            amount = @decrypted_data[:amount].to_f
          else
            amount = 0.00
            points = @decrypted_data[:points].to_i
          end

          encrypted_data = data.split('$')
          if encrypted_data.length != 2
            raise "Invalid authorization code format"
          end
                
          if @venue_id && (@venue.id != @venue_id.to_i)
            Request.set_status(@request, :failed)
            logger.error("Mismatch venue information, venue id:#{@venue_id}, merchant venue id:#{@venue.id}")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.purchase_rewards.venue_mismatch").split(/\n/) } }
            end
            normal_exit = true
            raise
          end
                  
          data = encrypted_data[1]

          if not signed_in?
            @first_time = false
            if @decrypted_data[:tag_id]
              tag = UserTag.first(:tag_id => @decrypted_data[:tag_id])
              if tag
                if tag.status == :suspended || tag.status == :deleted
                  logger.info("Tag: #{tag.tag_id} is suspended or deleted ")
                  respond_to do |format|
                    #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                    format.json { render :json => { :success => false, :message => t("api.invalid_tag").split(/\n/) } }
                  end
                  normal_exit = true
                  raise
                end
                user_to_tag = UserToTag.first(:fields => [:user_id], :user_tag_id => tag.id)
                if user_to_tag.nil? && tag.status == :pending
                  if @decrypted_data[:phone_id]
                    if (@current_user = User.first(:phone => @decrypted_data[:phone_id]))
                      if @current_user.status == :pending
                        tag.uid = @decrypted_data[:uid] if tag.uid.empty?
                        @current_user.register_tag(tag, tag.status)
                      else
                        respond_to do |format|
                          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                          format.json { render :json => { :success => false, :message => I18n.t('errors.taken', :attribute => User.human_attribute_name(:phone_number)).split(/\n/) } }
                        end
                        normal_exit = true
                        raise
                      end
                    else  
                      user_info = {}
                      rand_name = String.random_alphanumeric(16)
                      user_info[:name] = "#{rand_name}"
                      user_info[:email] = "#{rand_name}@getkickbak.com"
                      user_info[:phone] = @decrypted_data[:phone_id]
                      user_info[:role] = "anonymous"
                      user_info[:status] = :pending
                      password = String.random_alphanumeric(8)
                      user_info[:password] = password
                      user_info[:password_confirmation] = password
                      @current_user = User.create(user_info)
                      tag.uid = @decrypted_data[:uid] if tag.uid.empty?
                      @current_user.register_tag(tag, tag.status)
                      @first_time = true
                    end
                  elsif params[:version] && params[:version] >= "2.1.2"
                    respond_to do |format|
                      #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                      format.json { render :json => { :success => false, :metaData => { :rescode => "unregistered_account" } } }
                    end
                    normal_exit = true
                    raise 
                  else
                    user_info = {}
                    rand_name = String.random_alphanumeric(16)
                    user_info[:name] = "#{rand_name}"
                    user_info[:email] = "#{rand_name}@getkickbak.com"
                    user_info[:role] = "anonymous"
                    user_info[:status] = :pending
                    password = String.random_alphanumeric(8)
                    user_info[:password] = password
                    user_info[:password_confirmation] = password
                    @current_user = User.create(user_info)
                    tag.uid = @decrypted_data[:uid] if tag.uid.empty?
                    @current_user.register_tag(tag, tag.status)
                    @first_time = true
                  end
                else
                  if user_to_tag
                    @current_user = User.get(user_to_tag.user_id)
                    if @current_user.nil?
                      logger.error("No such user: #{user_to_tag.user_id}")
                      respond_to do |format|
                        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                        format.json { render :json => { :success => false, :message => t("api.invalid_user").split(/\n/) } }
                      end
                      normal_exit = true
                      raise
                    else
                      if tag.uid.empty?
                        tag.uid = @decrypted_data[:uid] 
                        tag.save   
                      end
                    end
                  else
                    logger.error("No user is associated with this non-pending tag: #{tag.tag_id}")
                    respond_to do |format|
                      #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                      format.json { render :json => { :success => false, :message => t("api.invalid_tag").split(/\n/) } }
                    end
                    normal_exit = true
                    raise
                  end  
                end
              else
                logger.error("No such tag_id: #{@decrypted_data[:tag_id]}")
                respond_to do |format|
                  #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                  format.json { render :json => { :success => false, :message => t("api.invalid_tag").split(/\n/) } }
                end
                normal_exit = true
                raise
              end
            elsif @decrypted_data[:phone_id]
              @current_user = User.first(:phone => @decrypted_data[:phone_id])
              if @current_user.nil?
                 user_info = {}
                 rand_name = String.random_alphanumeric(16)
                 user_info[:name] = "#{rand_name}"
                 user_info[:email] = "#{rand_name}@getkickbak.com"
                 user_info[:phone] = @decrypted_data[:phone_id]
                 user_info[:role] = "anonymous"
                 user_info[:status] = :pending
                 password = String.random_alphanumeric(8)
                 user_info[:password] = password
                 user_info[:password_confirmation] = password
                 @current_user = User.create(user_info)
                 @first_time = true
              end 
            else 
              logger.error("Missing user identification info")
              respond_to do |format|
                #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
                format.json { render :json => { :success => false, :message => t("api.missing_user_info").split(/\n/) } }
              end
              normal_exit = true
              raise  
            end  
          else
            @current_user = current_user  
          end
        
          if @current_user.status != :active && @current_user.status != :pending
            Request.set_status(@request, :failed)
            logger.error("User: #{@current_user.id} is not active or pending")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.inactive_user").split(/\n/) } }
            end
            normal_exit = true
            raise
          end
        end
      rescue DataMapper::SaveFailureError => e  
        Request.set_status(@request, :failed)
        logger.error("Exception: " + e.resource.errors.inspect)  
        respond_to do |format|
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
        end
        return
      rescue StandardError => e
        Request.set_status(@request, :failed)
        if not normal_exit
          logger.error("Exception: " + e.message)
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
          end
        end
        return
      end
    end
    end_time = Time.now
    logger.info("Performance Test: Earn Common Part 1 #{end_time - start_time} secs")
    # end
      
    # Performance Test
    start_time = Time.now  
    if @venue.status != :active
      Request.set_status(@request, :failed)
      logger.info("User(#{@current_user.id}) failed to earn points at Venue(#{@venue.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split(/\n/) } }
      end
      return
    end
    if @venue_id.nil?
      @venue.eager_load_type = @venue.type
      @venue.merchant.eager_load_type = @venue.merchant.type
    end

    @customer = Customer.first(:merchant => @venue.merchant, :user => @current_user)
    if @customer.nil?
      if (@venue.merchant.role == "merchant" && @current_user.role == "user") || (@venue.merchant.role == "test" && @current_user.role == "test") || @current_user.role == "admin" || @current_user.role == "anonymous"
        @customer = Customer.create(@venue.merchant, @current_user)
      else
        Request.set_status(@request, :failed)
        logger.info("User(#{@current_user.id}) failed to earn points at Merchant(#{@venue.merchant.id}), account not compatible with merchant")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split(/\n/) } }
        end
        return
      end
    end

    logger.info("Earn Points at Venue(#{@venue.id}), Customer(#{@customer.id}), User(#{@current_user.id})")

    if @venue.merchant.will_terminate && (Date.today > (@venue.merchant.terminate_date - 30))
      Request.set_status(@request, :failed)
      logger.info("User(#{@current_user.id}) failed to earn points at Merchant(#{@venue.merchant.id}), program is being terminated")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.program_termination").split(/\n/) } }
      end
      return
    end
    end_time = Time.now
    logger.info("Performance Test: Earn Common Part 2 #{end_time - start_time} secs")
    # end
  
    # Performance Test
    start_time = Time.now
    @badges = Common.populate_badges(@venue.merchant, session[:user_agent] || :iphone, session[:resolution] || :mxhdpi)
    
    Time.zone = @venue.time_zone
    begin
      Customer.transaction do
        # Performance Test
        start_time1 = Time.now
        @customer_mutex = CacheMutex.new(@customer.mutex_key, Cache.memcache)
        acquired = @customer_mutex.acquire
        @customer.reload
        end_time1 = Time.now
        logger.info("Performance Test: Earn Common Part 3-1 #{end_time1 - start_time1} secs")
        # end
        
        # Performance Test
        start_time2 = Time.now
        #logger.debug("Authorized to earn points.")
        prize_points = 1
        @reward_info = { :points => 0, :signup_points => 0, :referral_points => 0, :birthday_points => 0, :badge_points => 0, :prize_points => 0, :eligible_prize_id => 0 }
        now = Time.now
        challenge_type_id = ChallengeType.value_to_id["referral"]
        challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
        referral_challenge = false
        if challenge && (referral_record = ReferralChallengeRecord.first(:referral_id => @customer.id, :status => :pending)) && (referral_record.referrer_id != @customer.id)
          referrer = Customer.get(referral_record.referrer_id)
          @referrer_mutex = CacheMutex.new(referrer.mutex_key, Cache.memcache)
          acquired = @referrer_mutex.acquire
          referrer.reload
          referrer_reward_record = EarnRewardRecord.new(
            :type => :challenge,
            :ref_id => challenge.id,
            :venue_id => @venue.id,
            :data => "",
            :data_expiry_ts => ::Constant::MIN_TIME,
            :points => challenge.points,
            :created_ts => now,
            :update_ts => now
          )
          referrer_reward_record.merchant = @venue.merchant
          referrer_reward_record.customer = referrer
          referrer_reward_record.user = referrer.user
          referrer_reward_record.save
          referrer_trans_record = TransactionRecord.new(
            :type => :earn_points,
            :ref_id => referrer_reward_record.id,
            :description => challenge.name,
            :points => challenge.points,
            :created_ts => now,
            :update_ts => now
          )
          referrer_trans_record.merchant = @venue.merchant
          referrer_trans_record.customer = referrer
          referrer_trans_record.user = referrer.user
          referrer_trans_record.save
          referral_reward_record = EarnRewardRecord.new(
            :type => :challenge,
            :ref_id => challenge.id,
            :venue_id => @venue.id,
            :data => "",
            :data_expiry_ts => ::Constant::MIN_TIME,
            :points => challenge.data.referral_points,
            :created_ts => now,
            :update_ts => now
          )
          referral_reward_record.merchant = @venue.merchant
          referral_reward_record.customer = @customer
          referral_reward_record.user = @current_user
          referral_reward_record.save
          referral_trans_record = TransactionRecord.new(
            :type => :earn_points,
            :ref_id => referral_reward_record.id,
            :description => challenge.name,
            :points => challenge.points,
            :created_ts => now,
            :update_ts => now
          )
          referral_trans_record.merchant = @venue.merchant
          referral_trans_record.customer = @customer
          referral_trans_record.user = @current_user
          referral_trans_record.save
          referrer.points += challenge.points
          referrer.update_ts = now
          referrer.save
          @customer.points += challenge.data.referral_points
          referral_record.status = :complete
          referral_record.update_ts = now
          referral_record.save
          referral_challenge = true
          @reward_info[:referral_points] = challenge.data.referral_points
        end
        birthday = @current_user.profile.birthday
        today = now.to_date
        if (birthday.mon == today.mon) && (birthday.day == today.day)
          challenge_type_id = ChallengeType.value_to_id["birthday"]
          challenge = Challenge.first(:challenge_to_type => { :challenge_type_id => challenge_type_id }, :challenge_venues => { :venue_id => @venue.id })
          if challenge && (EarnRewardRecord.count(:type => :challenge, :ref_id => challenge.id, :merchant => challenge.merchant, :user => @current_user, :created_ts.gte => 11.month.ago.to_time) == 0)
            birthday_reward_record = EarnRewardRecord.new(
              :type => :challenge,
              :ref_id => challenge.id,
              :venue_id => @venue.id,
              :data => "",
              :data_expiry_ts => ::Constant::MIN_TIME,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            birthday_reward_record.merchant = @venue.merchant
            birthday_reward_record.customer = @customer
            birthday_reward_record.user = @current_user
            birthday_reward_record.save
            birthday_trans_record = TransactionRecord.new(
              :type => :earn_points,
              :ref_id => birthday_reward_record.id,
              :description => challenge.name,
              :points => challenge.points,
              :created_ts => now,
              :update_ts => now
            )
            birthday_trans_record.merchant = @venue.merchant
            birthday_trans_record.customer = @customer
            birthday_trans_record.user = @current_user
            birthday_trans_record.save
            @customer.points += challenge.points
            @reward_info[:birthday_points] = challenge.points
          end
        end
        @customer.visits += 1
        @customer.next_badge_visits += 1

        reward_model = @venue.merchant.reward_model

        if @customer.visits == 1 && reward_model.signup_points > 0
          record = EarnRewardRecord.new(
            :type => :signup,
            :venue_id => @venue.id,
            :points => reward_model.signup_points,
            :created_ts => now,
            :update_ts => now
          )
          record.merchant = @venue.merchant
          record.customer = @customer
          record.user = @current_user
          record.save
          trans_record = TransactionRecord.new(
            :type => :signup_points,
            :ref_id => record.id,
            :description => I18n.t("transaction.signup"),
            :points => reward_model.signup_points,
            :created_ts => now,
            :update_ts => now
          )
          trans_record.merchant = @venue.merchant
          trans_record.customer = @customer
          trans_record.user = @current_user
          trans_record.save
          @customer.points += reward_model.signup_points
          @reward_info[:signup_points] = reward_model.signup_points
        end
        
        # Performance Test
        start_time2_2 = Time.now
        if reward_model_type.value == "amount_spent"
          points = (amount / reward_model.price_per_point).to_i
        end  
        @record = EarnRewardRecord.new(
          :type => :purchase,
          :venue_id => @venue.id,
          :data => data,
          :data_expiry_ts => data_expiry_ts,
          :points => points,
          :amount => amount,
          :created_ts => now,
          :update_ts => now
        )
        @record.merchant = @venue.merchant
        @record.customer = @customer
        @record.user = @current_user
        @record.save
        end_time2_2_1 = Time.now
        logger.info("Performance Test: Earn Common Part 3-2-2-1 #{end_time2_2_1 - start_time2_2} secs")
        trans_record = TransactionRecord.new(
          :type => :earn_points,
          :ref_id => @record.id,
          :description => I18n.t("transaction.earn"),
          :points => points,
          :created_ts => now,
          :update_ts => now
        )
        trans_record.merchant = @venue.merchant
        trans_record.customer = @customer
        trans_record.user = @current_user
        trans_record.save
        @customer.points += points
        @reward_info[:points] = points
        end_time2_2 = Time.now
        logger.info("Performance Test: Earn Common Part 3-2-2-2 #{end_time2_2 - end_time2_2_1} secs")        
        logger.info("Performance Test: Earn Common Part 3-2-2 #{end_time2_2 - start_time2_2} secs")
        # end
        end_time2 = Time.now
        logger.info("Performance Test: Earn Common Part 3-2 #{end_time2 - start_time2} secs")
        # end
  
        # Performance Test
        start_time3 = Time.now
        #logger.debug("Before acquiring cache mutex.")
        @venue_mutex = CacheMutex.new(@venue.mutex_key, Cache.memcache)
        acquired = @venue_mutex.acquire
        #logger.debug("Cache mutex acquired(#{acquired}).")
        @pick_prize_initialized = false
        reward_model = @venue.merchant.reward_model
        (reward_model.avg_spend = (reward_model.avg_spend * reward_model.total_visits + amount) / (reward_model.total_visits + 1).round(2)) if amount > 0.00
        reward_model.total_visits += 1
        reward_model.save
          
        if @customer.badge_reset_ts <= @venue.merchant.badges_update_ts
          @customer.badge, @customer.next_badge_visits = Common.find_badge(@badges.to_a, @customer.visits)
          @customer.badge_reset_ts = now
        end
        previous_badge = @customer.badge
        next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
        if (@customer.next_badge_visits >= next_badge.visits) && (@customer.badge.id != next_badge.id)
          #logger.debug("expected average spend: #{reward_model.expected_avg_spend}")
          #logger.debug("next badge visits: #{next_badge.visits}")
          #logger.debug("price per point: #{reward_model.price_per_point}")
          if reward_model_type.value == "amount_spent"
            badge_points =  (reward_model.expected_avg_spend * reward_model.badge_rebate_rate / 100  * next_badge.visits / reward_model.price_per_point).to_i
          else
            badge_points = (1 / reward_model.badge_rebate_rate * next_badge.visits).to_i
            badge_points = (badge_points >= 1 ? badge_points : 1)
          end  
          @customer.customer_to_badge.destroy
          @customer.badge = next_badge
          @customer.points += badge_points
          @customer.next_badge_visits = 0
          next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
          @reward_info[:badge_points] = badge_points

          badge_record = EarnRewardRecord.new(
            :type => :badge,
            :venue_id => @venue.id,
            :points => badge_points,
            :created_ts => now,
            :update_ts => now
          )
          badge_record.merchant = @venue.merchant
          badge_record.customer = @customer
          badge_record.user = @current_user
          badge_record.save
          badge_trans_record = TransactionRecord.new(
            :type => :earn_points,
            :ref_id => badge_record.id,
            :description => I18n.t("transaction.earn"),
            :points => badge_points,
            :created_ts => now,
            :update_ts => now
          )
          badge_trans_record.merchant = @venue.merchant
          badge_trans_record.customer = @customer
          badge_trans_record.user = @current_user
          badge_trans_record.save
        end
        end_time3 = Time.now
        logger.info("Performance Test: Earn Common Part 3-3 #{end_time3 - start_time3} secs")
        # end
        
        # Performance Test
        start_time4 = Time.now  
        prize_info = @venue.prize_info
        if prize_info.prize_interval == 0
          prize_interval = pick_prize_interval(reward_model, @venue)
          prize_info.prize_interval = prize_interval
          prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
        else
          prize_interval = prize_info.prize_interval
        end
        current_point_offset = prize_info.prize_point_offset + points
        #logger.debug("Check if Prize has been won yet.")
        won_prize_before = EarnPrizeRecord.count(:customer => @customer, :points.gt => 1) > 0
        if (prize_info.prize_point_offset < prize_info.prize_win_offset)
          if (current_point_offset >= prize_info.prize_win_offset) || ((@customer.visits > 1) && !won_prize_before)
            prize_points = prize_interval
          end
          if (current_point_offset < prize_info.prize_win_offset) && ((@customer.visits > 1) && !won_prize_before)
            prize_info.prize_win_offset = current_point_offset
          end
        end
        if current_point_offset >= prize_interval
          #logger.debug("Current Point Offset >= Prize Interval.")
          current_point_offset -= prize_interval
          prize_interval = pick_prize_interval(reward_model, @venue)
          prize_info.prize_interval = prize_interval
          prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
          if (prize_points == 1) && ((current_point_offset >= prize_info.prize_win_offset) || ((@customer.visits > 1) && !won_prize_before))
            prize_points = prize_interval
            if current_point_offset >= prize_info.prize_win_offset
              prize_interval = pick_prize_interval(reward_model, @venue)
              prize_info.prize_interval = prize_interval
              prize_info.prize_win_offset = pick_prize_win_offset(prize_interval) + 1
              current_point_offset = current_point_offset % prize_interval
            else
              prize_info.prize_win_offset = current_point_offset
            end
          elsif current_point_offset >= prize_info.prize_win_offset
            current_point_offset = pick_prize_win_offset(prize_info.prize_win_offset - 1) + 1
          end
        end
        #logger.debug("Set Prize Point Offset = Current Point Offset.")
        prize_info.prize_point_offset = current_point_offset
        prize_info.save

        previous_prize_points = @customer.prize_points
        @customer.prize_points += prize_points
        @reward_info[:prize_points] = prize_points

        prize_record = EarnPrizeRecord.new(
          :venue_id => @venue.id,
          :points => prize_points,
          :created_ts => now,
          :update_ts => now
        )
        prize_record.merchant = @venue.merchant
        prize_record.customer = @customer
        prize_record.user = @current_user
        prize_record.save
        prize_trans_record = TransactionRecord.new(
          :type => :earn_prize_points,
          :ref_id => prize_record.id,
          :description => I18n.t("transaction.earn"),
          :points => prize_points,
          :created_ts => now,
          :update_ts => now
        )
        prize_trans_record.merchant = @venue.merchant
        prize_trans_record.customer = @customer
        prize_trans_record.user = @current_user
        prize_trans_record.save
          
        @prize_jackpots = EarnPrizeRecord.count(:merchant => @venue.merchant, :points.gt => 1, :created_ts.gte => today.at_beginning_of_month.to_time)
        @account_info = {}
        @account_info[:visits] = @customer.visits
        @account_info[:next_badge_visits] = @customer.next_badge_visits
        @account_info[:points] = @customer.points
        @account_info[:prize_points] = @customer.prize_points
        @account_info[:badge_id] = @customer.badge.id
        @account_info[:next_badge_id] = next_badge.id
        rewards = Common.get_rewards_by_venue(@venue, :reward)
        prizes = Common.get_rewards_by_venue(@venue, :prize)
        new_eligible_prize = Common.find_eligible_reward(prizes.to_a, @customer.prize_points - previous_prize_points)
        @reward_info[:eligible_prize_id] = new_eligible_prize.id if !new_eligible_prize.nil?
        eligible_reward = Common.find_eligible_reward(rewards.to_a, @customer.points)
        eligible_prize = Common.find_eligible_reward(prizes.to_a, @customer.prize_points)
        eligible_for_reward = !eligible_reward.nil?
        eligible_for_prize = !eligible_prize.nil?
        @customer.eligible_for_reward = eligible_for_reward
        @customer.eligible_for_prize = eligible_for_prize
        @customer.update_ts = now
        @customer.save
        @account_info[:eligible_for_reward] = eligible_for_reward
        @account_info[:eligible_for_prize] = eligible_for_prize
        if @venue_id.nil?
          @rewards = rewards
          @prizes = prizes
        end
        Request.set_status(@request, :complete)
        if @current_user.facebook_auth
          posts = [ 
            FacebookPost.new(
              :type => "earn_points",
              :message => (t("facebook_post.message.earn_points") % [@venue.name]),
              :page_id => @venue.facebook_page_id
            )
          ]
          if @customer.badge.id != previous_badge.id && (session[:version].nil? || session[:version] && session[:version] >= "2.1.2")
            if reward_model_type.value == "amount_spent"
              message = t("facebook_post.description.amount_spent")
            elsif reward_model_type.value == "items_purchased"
              message = t("facebook_post.description.items_purchased") % [rewards.first.title]
            elsif reward_model_type.value == "visits"  
              message = t("facebook_post.description.visits") % [rewards.first.title]
            end
            posts << FacebookPost.new(
              :type => "badge_promotion",
              :message => (t("facebook_post.message.badge_promotion") % [@customer.badge.type.value.capitalize, @venue.name]),
              :picture => (@customer.badge.custom ? @customer.badge.custom_type.thumbnail_large_url : @customer.badge.type.thumbnail_large_url),
              :link_name => @venue.name,
              :link => business_profile_url(@venue.merchant),
              :caption => "www.getkickbak.com",
              :description => "#{message}\n#{t("facebook_post.description.text")}"
            )
          end
          Resque.enqueue(ShareOnFacebook, @current_user.id, @venue.id, ShareOnFacebook::EARN_POINTS, posts.to_json)
        end
        if @current_user.subscription.nil?
          Subscription.create(@current_user)
        end
        if !signed_in? && @current_user.status == :pending
          if @first_time
            sms_message_type = SmsMessageType::MERCHANT_REGISTRATION
            options = { :name => @venue.name, :points => @reward_info[:points], :prize_points => @reward_info[:prize_points] }.to_json
          else
            if eligible_for_reward || eligible_for_prize
              sms_message_type = SmsMessageType::MERCHANT_REGISTRATION_REMINDER_REWARD
              reward_name = eligible_for_reward ? eligible_reward.title : eligible_prize.title
              options = { :name => @venue.name, :reward_name => reward_name }.to_json
            else
              sms_message_type = SmsMessageType::MERCHANT_REGISTRATION_REMINDER
              options = { :name => @venue.name, :points => @reward_info[:points], :prize_points => @reward_info[:prize_points] }.to_json
            end
          end
          Resque.enqueue(SendSms, SmsProvider.get_current, sms_message_type, @current_user.id, nil, options) if !@current_user.phone.empty?
        end
        if !signed_in? && @current_user.status != :pending && @current_user.subscription.email_notif
          if @reward_info[:birthday_points] > 0 || @reward_info[:badge_points] > 0 || @reward_info[:prize_points] > 1
            UserAsyncMailer.reward_notif_email(@customer.id, @reward_info.to_json).deliver
          elsif eligible_for_reward
            UserAsyncMailer.eligible_reward_email(@customer.id, eligible_reward.id).deliver
          end
        end
        if referral_challenge
          UserAsyncMailer.referral_challenge_confirm_email(referrer.user.id, @current_user.id, @venue.id, referral_record.id).deliver
        end
        render :template => '/api/v1/purchase_rewards/earn'
        logger.info(
          "User(#{@current_user.id}) successfully earned #{@reward_info[:points]} points, #{@reward_info[:signup_points]} signup points, #{@reward_info[:referral_points]} referral points, #{@reward_info[:birthday_points]} birthday points, #{@reward_info[:badge_points]} badge points, #{@reward_info[:prize_points]} prize points at Venue(#{@venue.id})"
        )
        end_time4 = Time.now
        logger.info("Performance Test: Earn Common Part 3-4 #{end_time4 - start_time4} secs")
        # end
      end
    rescue DataMapper::SaveFailureError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
      end
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.purchase_rewards.earn_failure").split(/\n/) } }
      end
    ensure
      @venue_mutex.release if ((defined? @venue_mutex) && !@venue_mutex.nil?)
      @referrer_mutex.release if ((defined? @referrer_mutex) && !@referrer_mutex.nil?)
      @customer_mutex.release if ((defined? @customer_mutex) && !@customer_mutex.nil?)
    end
    
    end_time = Time.now
    logger.info("Performance Test: Earn Common Part 3 #{end_time - start_time} secs")
    # end
  end
  
  def pick_prize_interval(reward_model, venue)
    if not @pick_prize_initialized
      @prize_rewards = CustomerReward.all(:customer_reward_venues => { :venue_id => venue.id }, :mode => :prize, :order => [:points.asc])
      @min_prize_points = @prize_rewards.first.points
      @max_prize_points = @prize_rewards.last.points
      @pick_prize_initialized = true
    end
    Random.rand(@max_prize_points - @min_prize_points + 1) + @min_prize_points
  end

  def pick_prize_win_offset(prize_interval)
    Random.rand(prize_interval)
  end
end