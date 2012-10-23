class Api::V1::CheckInsController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    authorize! :update, Customer
    
    @venue_id = params[:venue_id]
    if !APP_PROP["SIMULATOR_MODE"] && current_user.role != "test"
      if @venue_id.nil?
        begin
          encrypted_data = params[:auth_code].split('$')
          if encrypted_data.length != 2
            raise "Invalid check-in code format"
          end
          venue = Venue.get(encrypted_data[0])
          if venue.nil?
            raise "No such venue: #{encrypted_data[0]}"
          end
          cipher = Gibberish::AES.new(venue.auth_code)
          decrypted = cipher.dec(encrypted_data[1])
          decrypted_data = JSON.parse(decrypted)
          checkInCode = CheckInCode.first(:auth_code => decrypted_data["auth_code"])
          if checkInCode.nil?
            raise "Incorrect check-in code: #{decrypted_data["auth_code"]}"
          end
          @venue = checkInCode.venue
        rescue StandardError => e
          logger.error("Exception: " + e.message)
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :message => t("api.check_ins.invalid_code").split('\n') } }  
          end  
          return
        end
      else
        @venue = Venue.get(@venue_id) || not_found
      end
    else
      if @venue_id.nil?
        @venue = Venue.first(:offset => 0, :limit => 1)
      else
        @venue = Venue.get(@venue_id) || not_found
      end
    end
    
    if @venue.status != :active
      logger.info("User(#{current_user.id}) failed to check-in at Venue(#{@venue.id}), venue is not active")
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split('\n') } }
      end
      return  
    end
    
    @customer = Customer.first(:merchant => @venue.merchant, :user => current_user)
    if @customer.nil?
      if (@venue.merchant.role == "merchant" && current_user.role == "user") || (@venue.merchant.role == "test" && current_user.role == "test") || current_user.role = "admin"
        @customer = Customer.create(@venue.merchant, current_user)  
      else
        logger.info("User(#{current_user.id}) failed to check-in at Merchant(#{@venue.merchant.id}), account not compatible with merchant")
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.incompatible_merchant_user_role").split('\n') } }
        end
        return
      end  
    end
    
    Time.zone = @venue.time_zone
    
    @badges = Common.populate_badges(@venue.merchant, request.env['HTTP_USER_AGENT'])
       
    begin
      CheckIn.transaction do
        now = Time.now
        last_check_in = CheckIn.create(@venue, current_user, @customer)
        @prize_jackpots = EarnPrizeRecord.count(:merchant => @venue.merchant, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
        if @customer.badge_reset_ts <= @venue.merchant.badges_update_ts
          @customer.badge, @customer.next_badge_visits = Common.find_badge(@badges.to_a, @customer.visits)
          @customer.badge_reset_ts = Time.now
          @customer.save
        end
        @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
        @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
        @rewards = Common.get_rewards(@venue, :reward)
        @prizes = Common.get_rewards(@venue, :prize)
        @newsfeed = Common.get_news(@venue)
        render :template => '/api/v1/check_ins/create'
        session[:session_test] = String.random_alphanumeric
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.check_ins.create_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.check_ins.create_failure").split('\n') } }
      end  
    end    
  end
end