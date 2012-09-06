class Api::V1::CustomersController < ApplicationController
  before_filter :authenticate_user!
   
  def index
    authorize! :read, Customer

    start = params[:start].to_i
    max = params[:limit].to_i
    @results = Customer.find(current_user.id, start, max)
    render :template => '/api/v1/customers/index'
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

    if @customer.merchant.status != :active
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_merchant").split('\n') } }
      end
      return  
    end
    
    logger.info("Transfer points Customer(#{@customer.id}), User(#{current_user.id})")
    begin
      Customer.transaction do
        now = Time.now
        @type = params[:type]
        points = params[:points].to_i
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
            @body = TransferPoints.new(current_user, @customer.merchant, record).render_html
            render :template => '/api/v1/customers/transfer_points'
            logger.info("User(#{current_user.id}) successfully created email transfer qr code worth #{points} points for Customer Account(#{@customer.id})")
          else
            data = { 
              :type => EncryptedDataType::POINTS_TRANSFER_DIRECT,
              :id => record.id
            }.to_json
            cipher = Gibberish::AES.new(@customer.merchant.auth_code)
            @encrypted_data = "#{@customer.merchant.id}$#{cipher.enc(data)}"
            render :template => '/api/v1/customers/transfer_points'
            logger.info("User(#{current_user.id}) successfully created direct transfer qr code worth #{points} points for Customer Account(#{@customer.id})")
          end
        else
          logger.info("User(#{current_user.id}) failed to create transfer qr code worth #{points} points for Customer Account(#{@customer.id}), insufficient points")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [points, t('api.point', :count => points)]).split('\n') } }
          end
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.transfer_points_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.transfer_points_failure").split('\n') } }
      end  
    end    
  end

  def receive_points
    data = params[:data].split('$')
    merchant = Merchant.get(data[0]) || not_found
    if merchant.status != :active
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_merchant").split('\n') } }
      end
      return  
    end
    @customer = Customer.first(:user => current_user, :merchant => merchant)
    if @customer.nil?
      if (merchant.role == "merchant" && current_user.role == "user") || (merchant.role == "test" && currrent_user.role == "test")
        @customer = Customer.create(merchant, current_user)
      else
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split('\n') } }
        end
      end  
    end
    authorize! :read, @customer
    
    logger.info("Receive points Customer(#{@customer.id}), User(#{current_user.id})")
    authorized = false
    invalid_code = false
    
    begin
      #logger.debug("data: #{data}")
      cipher = Gibberish::AES.new(@customer.merchant.auth_code)
      decrypted = cipher.dec(data[1])
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
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
      logger.error("Exception: " + e.message)
      logger.info("Customer(#{@customer.id}) failed to receive points, invalid transfer code")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customers.invalid_transfer_code").split('\n') } }
      end  
      return
    end
    
    begin
      Customer.transaction do
        if authorized
          sender = Customer.get(@record.sender_id)
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
            render :template => '/api/v1/customers/receive_points'
            if decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_EMAIL
              UserMailer.transfer_points_confirm_email(sender.user, current_user, merchant, @record).deliver
            end
            logger.info("Customer(#{@record.sender_id}) successfully received #{@record.points} points from Customer(#{@record.recipient_id})") 
          else
            logger.info("Customer(#{@customer.id}) failed to receive points, insufficient points")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [@record.points, t('api.point', :count => @record.points)]).split('\n') } }
            end  
          end
        else
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
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.receive_points_failure").split('\n') } }
      end
    rescue StandardError => e
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