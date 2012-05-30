class Api::V1::CustomersController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_user!, :only => [:edit, :update, :destroy]
   
  def index
    authorize! :read, Customer

    start = params[:start].to_i
    max = params[:limit].to_i
    @results = Customer.find(current_user.id, start, max)
    render :template => '/api/v1/customers/index'
  end
  
  def transfer_points
    @customer = Customer.first(Customer.user.id => current_user.id, Customer.merchant.id => params[:merchant_id]) || not_found
    authorize! :read, @customer
    
    logger.info("Transfer points Customer(#{@customer.id}), User(#{current_user.id})")
    begin
      Customer.transaction do
        now = Time.now
        @type = params[:type]
        points = params[:points].to_i
        if @customer.points >= points
          record = TransferPointsRecord.create(
            :sender_id => @customer.id,
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
            @subject = t("api.customers.email_subject_points_transfer")
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
    @customer = Customer.first(Customer.user.id => current_user.id, Customer.merchant.id => merchant.id)
    if @customer.nil?
      @customer = Customer.create(merchant, current_user)
    end
    authorize! :read, @customer
    
    logger.info("Receive points Customer(#{@customer.id}), User(#{current_user.id})")
    authorized = false
    invalid_code = false
    
    begin
      cipher = Gibberish::AES.new(@customer.merchant.auth_code)
      decrypted = cipher.dec(data[1])
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      transfer_id = decrypted_data["id"]
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted id: #{transfer_id}")
      #logger.debug("decrypted data: #{data}")
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
          mutex = CacheMutex.new(sender.cache_key, Cache.memcache)
          acquired = mutex.acquire
          sender.reload
          if sender.points >= @record.points
            sender.points -= @record.points
            sender.save
            @customer.points += @record.points
            @customer.save
            @record.recipient_id = @customer.id
            @record.status = :complete
            @record.update_ts = Time.now
            @record.save 
            render :template => '/api/v1/customers/receive_points'
            if decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER_EMAIL
              UserMailer.transfer_points_confirm_email(sender.user, current_user, merchant, @record)
            end
            logger.info("Customer(#{@record.sender_id}) successfully received #{@record.points} points from Customer(#{@record.recipient_id})") 
          else
            logger.info("Customer(#{@customer.id}) failed to receive points, insufficient points")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [@record.points, t('api.point', :count => @record.points)]).split('\n') } }
            end  
          end
          mutex.release
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
      mutex.release if ((defined? mutex) && !mutex.nil?)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.receive_points_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      mutex.release if ((defined? mutex) && !mutex.nil?)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.customers.receive_points_failure").split('\n') } }
      end 
    end    
  end
end