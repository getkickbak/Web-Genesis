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
    Customer.transaction do
      begin
        type = params[:type]
        points = params[:points].to_i
        if @customer.points >= points
          record = TransferPointsRecord.create(
            :sender_id => @customer.id,
            :points => points,
            :created_ts => Time.now,
            :expiry_date => 1.month.from_now
          )
          data = { 
            :type => EncryptedDataType::POINTS_TRANSFER,
            :id => record.id
          }.to_json
          cipher = Gibberish::AES.new(@customer.merchant.auth_code)
          @encrypted_data = "#{@customer.merchant.id}$#{cipher.enc(data)}"
          if type == "email"
            @subject = t("api.customers.email_subject_points_transfer")
            @body = TransferPoints.new(current_user, @customer.merchant, record).render_html
            logger.info("User(#{current_user.id}) successfully created email transfer qr code worth #{points} points for Customer Account(#{@customer.id})")
            render :template => '/api/v1/customers/transfer_points_email'   
          else
            logger.info("User(#{current_user.id}) successfully created direct transfer qr code worth #{points} points for Customer Account(#{@customer.id})")
            render :template => '/api/v1/customers/transfer_points_direct'
          end
        else
          logger.info("User(#{current_user.id}) failed to create transfer qr code worth #{points} points for Customer Account(#{@customer.id}), insufficient points")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [points, t('api.point', :count => points)]).split('\n') } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.customers.transfer_points_failure").split('\n') } }
        end
      end
    end
  end

  def receive_points
    data = params[:data].split('$')
    merchant_id = data[0]
    @customer = Customer.first(Customer.user.id => current_user.id, Customer.merchant.id => merchant_id)
    if @customer.nil?
      merchant = Merchant.get(merchant_id) || not_found
      @customer = Customer.create(merchant, current_user)
    end
    authorize! :read, @customer
    
    logger.info("Receive points Customer(#{@customer.id}), User(#{current_user.id})")
    authorized = false
    
    begin
      real_data = data[1]
      cipher = Gibberish::AES.new(@customer.merchant.auth_code)
      decrypted = cipher.dec(real_data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      transfer_id = decrypted_data["id"]
      #logger.debug("decrypted type: #{decrypted_data["type"]}")
      #logger.debug("decrypted id: #{transfer_id}")
      #logger.debug("decrypted data: #{data}")
      #logger.debug("Type comparison: #{decrypted_data["type"] == EncryptedDataType::TRANSFER_POINTS}")
      #logger.debug("TranferPointsRecord comparison: #{TransferPointsRecord.first(:id => transfer_id, :status => :pending, :expiry_ts.gte => Time.now)}")
      if (decrypted_data["type"] == EncryptedDataType::POINTS_TRANSFER) && (@record = TransferPointsRecord.first(:id => transfer_id, :status => :pending, :expiry_date.gte => Date.today))
        #logger.debug("Set authorized to true")
        authorized = true
      end  
    rescue
      logger.info("Customer(#{@customer.id}) failed to receive points, invalid transfer code")
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.customers.invalid_transfer_code").split('\n') } }
      end  
    end
    
    Customer.transaction do
      begin
        if authorized
          sender = Customer.get(@record.sender_id)
          mutex = CacheMutex.new(sender.cache_key, Cache.memcache)
          acquired = mutex.acquire
          logger.debug("After mutex acquired")
          sender.reload
          logger.debug("After reload")
          if sender.points >= @record.points
            sender.points -= @record.points
            sender.save
            @customer.points += @record.points
            @customer.save
            @record.recipient_id = @customer.id
            @record.status = :completed
            @record.update_ts = Time.now
            @record.save
            logger.info("Customer(#{@record.sender_id}) successfully received #{@record.points} points from Customer(#{@record.recipient_id})") 
            render :template => '/api/v1/customers/receive_points'
          else
            logger.info("Customer(#{@customer.id}) failed to receive points, insufficient points")
            respond_to do |format|
              #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
              format.json { render :json => { :success => false, :message => (t("api.customers.insufficient_transfer_points") % [@record.points, t('api.point', :count => @record.points)]).split('\n') } }
            end  
          end
          mutex.relase
        else
          logger.info("Customer(#{@customer.id}) failed to receive points, transfer code expired")
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => t("api.customers.expired_transfer_code").split('\n') } }
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
end