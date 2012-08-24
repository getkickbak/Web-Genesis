class Api::V1::CheckInsController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    if !APP_PROP["SIMULATOR_MODE"] && current_user.role != "test"
      begin
        encrypted_data = params[:auth_code].split('$')
        venue = Venue.get(encrypted_data[0]) || not_found
        cipher = Gibberish::AES.new(venue.auth_code)
        decrypted = cipher.dec(encrypted_data[1])
        decrypted_data = JSON.parse(decrypted)
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.check_ins.invalid_code").split('\n') } }  
        end  
        return
      end
      checkInCode = CheckInCode.first(:auth_code => decrypted_data["auth_code"])
      if checkInCode.nil?
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.check_ins.invalid_code").split('\n') } }  
        end
        return
      end
      @venue = checkInCode.venue
    else
      if params[:venue_id]
        @venue = Venue.get(params[:venue_id])
      else
        @venue = Venue.first(:offset => 0, :limit => 1)
      end
    end  
    
    if @venue.status != :active
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.inactive_venue").split('\n') } }
      end
      return  
    end
    
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    if @customer.nil?
      @customer = Customer.create(@venue.merchant, current_user)
    end
    authorize! :update, @customer
    
    Time.zone = @venue.time_zone
    if !Common.within_geo_distance?(logger, current_user, params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.out_of_distance").split('\n') } }
      end
      return
    end
    
    @badges = Common.populate_badges(@venue.merchant, request.env['HTTP_USER_AGENT'])
       
    begin
      CheckIn.transaction do
        now = Time.now
        last_check_in = CheckIn.create(@venue, current_user, @customer)
        @prize_jackpots = EarnPrizeRecord.count(EarnPrizeRecord.merchant.id => @venue.merchant.id, :points.gt => 1, :created_ts.gte => Date.today.at_beginning_of_month.to_time)
        @next_badge = Common.find_next_badge(@badges.to_a, @customer.badge)
        @account_info = { :badge_id => @customer.badge.id, :next_badge_id => @next_badge.id }
        @rewards = Common.get_rewards(@venue, :reward)
        @prizes = Common.get_rewards(@venue, :prize)
        @newsfeed = Common.get_news(@venue)
        render :template => '/api/v1/check_ins/create'
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