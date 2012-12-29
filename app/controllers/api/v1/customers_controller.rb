class Api::V1::CustomersController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:show_account]
  before_filter :authenticate_user!, :except => [:show_account]
  skip_authorization_check :only => [:show_account]
   
  def index
    authorize! :read, Customer

    start = params[:start].to_i
    max = params[:limit].to_i
    @results = Customer.find(current_user.id, start, max)
    render :template => '/api/v1/customers/index'
  end
  
  def show_account
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
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      @tag = UserTag.first(:tag_id => decrypted_data["tag_id"])
      if @tag.nil?
        raise "No such tag: #{decrypted_data["tag_id"]}"
      end
      user_to_tag = UserToTag.first(:fields => [:user_id], :user_tag_id => @tag.id)
      if user_to_tag.nil?
        raise "No user is associated with this tag: #{decrypted_data["tag_id"]}"
      end
      user = User.get(user_to_tag.user_id)
      if user.nil?
        raise "No such user: #{user_to_tag.user_id}"
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customers.show_failure").split('\n') } }
      end
      return  
    end
    
    begin
      session[:user_agent] = Common.get_user_agent(request.env['HTTP_USER_AGENT'])
      session[:resolution] = Common.get_thumbail_resolution(session[:user_agent], params[:device_pixel_ratio].to_f)
      @customer = Customer.first(:merchant => @venue.merchant, :user => user)
      if @customer.nil?
        logger.error("User(#{user.id}) is not a customer of Merchant(#{@venue.merchant})")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.customers.invalid_customer").split('\n') } }
        end
        return
      end
      render :template => '/api/v1/customers/show_account'
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.show_failure").split('\n') } }
      end
    end
  end
  
  def show_jackpot_winners
    authorize! :read, Venue
    
    winner_records = EarnPrizeRecord.all(:fields => [:user_id, :points, :created_ts], :merchant_id => params[:merchant_id], :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
    winner_ids = []
    winner_records.each do |winner_record|
      winner_ids << winner_record[:user_id]
    end
    users = User.all(:id => winner_ids)
    user_id_to_user = {}
    users.each do |user|
      user_id_to_user[user.id] = user
    end
    @jackpot_winners = []
    winner_records.each do |winner_record|
      user = user_id_to_user[winner_record[:user_id]]
      @jackpot_winners << { :name => user.name, :facebook_id => user.facebook_id, :points => winner_record[:points], :time => winner_record[:created_ts].to_i*1000 }
    end
    render :template => '/api/v1/customers/show_jackpot_winners'  
  end
  
  def transfer_points
    @customer = Customer.first(:user => current_user, :merchant_id => params[:merchant_id]) || not_found
    authorize! :read, @customer

    logger.info("Transfer Points Merchant(#{@customer.merchant.id}), Customer(#{@customer.id}), User(#{current_user.id})")

    if @customer.merchant.status != :active
      logger.info("User(#{current_user.id}) failed to transfer points, merchant is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_merchant").split('\n') } }
      end
      return  
    end
    
    begin
      Customer.transaction do
        now = Time.now
        @type = params[:type]
        points = params[:points].to_i
        if points == 0
          raise "Cannot transfer 0 points"
        end
        if @customer.points >= points
          record = TransferPointsRecord.create(
            :sender_id => @customer.id,
            :sender_user_id => current_user.id,
            :merchant_id => @customer.merchant.id,
            :points => points,
            :expiry_date => 1.month.from_now,
            :created_ts => now,
            :update_ts => now
          )
          if @type == "email"
            data = { 
              :type => EncryptedDataType::POINTS_TRANSFER_EMAIL,
              :id => record.id
            }.to_json
            cipher = Gibberish::AES.new(@customer.merchant.auth_code)
            @encrypted_data = "#{@customer.merchant.id}$#{cipher.enc(data)}"
            @subject = t("mailer.email_subject_points_transfer")
            transfer_points = TransferPoints.new(current_user, @customer.merchant, record)
            case session[:user_agent]
            when :iphone
              @body = transfer_points.render_html
            when :android
              @body = transfer_points.render_simple_html  
            end  
            render :template => '/api/v1/customers/transfer_points'
            logger.info("User(#{current_user.id}) successfully created email transfer qr code worth #{points} points for Customer Account(#{@customer.id})")
            return
          else
            data = { 
              :type => EncryptedDataType::POINTS_TRANSFER_DIRECT,
              :id => record.id,
              :merchant_id => @customer.merchant.id
            }.to_json
            cipher = Gibberish::AES.new(@customer.merchant.auth_code)
            @encrypted_data = "#{@customer.merchant.id}$#{cipher.enc(data)}"
=begin            
            frequency = JSON.parse(params[:frequency])
            request_info = {
              :type => RequestType::TRANSFER_POINTS,
              :frequency1 => frequency[0],
              :frequency2 => frequency[1],
              :frequency3 => frequency[2],
              :latitude => params[:latitude],
              :longitude => params[:longitude],
              :data => data,
              :channel => Channel.reserve
            }
            @request = Request.create(request_info)
=end            
            render :template => '/api/v1/customers/transfer_points'
            logger.info("User(#{current_user.id}) successfully created direct transfer request worth #{points} points for Customer Account(#{@customer.id})")
            return
          end
        else
          logger.info("User(#{current_user.id}) failed to create transfer qr code worth #{points} points for Customer Account(#{@customer.id}), insufficient points")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [points, t('api.point', :count => points)]).split('\n') } }
          end
          return
        end
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.transfer_points_failure").split('\n') } }
      end  
      return
    end    
    
    if @request.is_status?(:complete)
      logger.info("User(#{current_user.id}) successfully completed Request(#{@request.id})")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => true } }
      end
    else
      logger.info("User(#{current_user.id}) failed to complete Request(#{@request.id})")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customers.transfer_points_failure").split('\n') } }
      end
    end
    @request.destroy
  end

  def receive_points
    authorize! :read, Customer
    
    authorized = false
    invalid_code = false
    
    begin
      if params[:frequency]
        frequency = JSON.parse(params[:frequency])
        request_info = {
          :type => RequestType::TRANSFER_POINTS,
          :frequency1 => frequency[0],
          :frequency2 => frequency[1],
          :frequency3 => frequency[2],
          :latitude => params[:latitude],
          :longitude => params[:longitude]
        }
        @request = Request.match(request_info)
        if @request.nil?
          raise "No matching transfer points request"
        end
        decrypted_data = JSON.parse(@request.data)
        merchant = Merchant.get(decrypted_data["merchant_id"])
        if merchant.nil?
          raise "No such merchant: #{decrypted_data["merchant_id"]}"
        end
      else
        encrypted_data = params[:data].split('$')
        if encrypted_data.length != 2
          raise "Invalid transfer code format"
        end
        merchant = Merchant.get(encrypted_data[0])
        if merchant.nil?
          raise "No such merchant: #{encrypted_data[0]}"
        end
        data = encrypted_data[1] 
        #logger.debug("data: #{data}")
        cipher = Gibberish::AES.new(merchant.auth_code)
        decrypted = cipher.dec(data)
        #logger.debug("decrypted text: #{decrypted}")
        decrypted_data = JSON.parse(decrypted) 
      end
    
      if merchant.status != :active
        Request.set_status(@request, :failed)
        logger.info("User(#{current_user.id}) failed to receive points at Merchant(#{merchant.id}), merchant is not active")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.inactive_merchant").split('\n') } }
        end
        return  
      end
        
      @customer = Customer.first(:user => current_user, :merchant => merchant)
      if @customer.nil?
        if (merchant.role == "merchant" && current_user.role == "user") || (merchant.role == "test" && current_user.role == "test") || current_user.role = "admin"
          @customer = Customer.create(merchant, current_user)
        else
          Request.set_status(@request, :failed)
          logger.info("User(#{current_user.id}) failed to receive points at Merchant(#{merchant.id}), account not compatible with merchant")
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split('\n') } }
          end
          return
        end  
      end
    
      transfer_id = decrypted_data["id"]
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted id: #{transfer_id}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_EMAIL && decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_DIRECT}")
      #logger.debug("TranferPointsRecord doesn't exists: #{TransferPointsRecord.first(:id => transfer_id, :status => :pending, :expiry_ts.gte => Time.now).nil?}")
      if (decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_EMAIL || decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_DIRECT)
        if (@record = TransferPointsRecord.first(:id => transfer_id, :status => :pending, :expiry_date.gte => Date.today))
          #logger.debug("Set authorized to true")
          authorized = true
        end
      else
        invalid_code = true 
      end  
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)  
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customers.invalid_transfer_code").split('\n') } }
      end  
      return
    end
    
    logger.info("Receive Points, Merchant(#{merchant.id}), Customer(#{@customer.id}), User(#{current_user.id})")

    begin
      Customer.transaction do
        if authorized
          sender = Customer.get(@record.sender_id)
          if sender.id == @customer.id
            Request.set_status(@request, :failed)
            logger.info("Customer(#{@customer.id}) failed to receive points from Customer(#{sender.id}), self transfer")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => t("api.customers.self_transfer_failure").split('\n') } }
            end  
            return
          end
          @sender_mutex = CacheMutex.new(sender.cache_key, Cache.memcache)
          acquired = @sender_mutex.acquire
          sender.reload
          @recipient_mutex = CacheMutex.new(@customer.cache_key, Cache.memcache)
          acquired = @recipient_mutex.acquire
          @customer.reload
          if sender.points >= @record.points
            now = Time.now
            sender.points -= @record.points
            sender.update_ts = now
            sender.save
            sender_trans_record = TransactionRecord.new(
              :type => :transfer_points,
              :ref_id => @record.id,
              :description => I18n.t("transaction.transfer"),
              :points => -@record.points,
              :created_ts => now,
              :update_ts => now
            )
            sender_trans_record.merchant = merchant
            sender_trans_record.customer = sender
            sender_trans_record.user = sender.user
            sender_trans_record.save
            @customer.points += @record.points
            @customer.update_ts = now
            @customer.save
            trans_record = TransactionRecord.new(
              :type => :transfer_points,
              :ref_id => @record.id,
              :description => I18n.t("transaction.transfer"),
              :points => @record.points,
              :created_ts => now,
              :update_ts => now
            )
            trans_record.merchant = merchant
            trans_record.customer = @customer
            trans_record.user = current_user
            trans_record.save
            @record.recipient_id = @customer.id
            @record.recipient_user_id = current_user.id
            @record.status = :complete
            @record.update_ts = now
            @record.save 
            Request.set_status(@request, :complete)
            render :template => '/api/v1/customers/receive_points'
            if decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_EMAIL
              UserMailer.transfer_points_confirm_email(sender.user, current_user, merchant, @record).deliver
            end
            logger.info("Customer(#{@record.sender_id}) successfully received #{@record.points} points from Customer(#{@record.recipient_id})") 
          else
            Request.set_status(@request, :failed)
            logger.info("Customer(#{@customer.id}) failed to receive points, insufficient points")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [@record.points, t('api.point', :count => @record.points)]).split('\n') } }
            end  
          end
        else
          Request.set_status(@request, :failed)
          if invalid_code
            msg = t("api.customers.invalid_transfer_code").split('\n')
            logger.info("Customer(#{@customer.id}) failed to receive points, invalid transfer code")
          else
            msg = t("api.customers.expired_transfer_code").split('\n')
            logger.info("Customer(#{@customer.id}) failed to receive points, transfer code expired")  
          end
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => msg } }
          end
        end
      end
    rescue StandardError => e
      Request.set_status(@request, :failed)
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.receive_points_failure").split('\n') } }
      end 
    ensure
      @recipient_mutex.release if ((defined? @recipient_mutex) && !@recipient_mutex.nil?)
      @sender_mutex.release if ((defined? @sender_mutex) && !@sender_mutex.nil?)  
    end    
  end
end