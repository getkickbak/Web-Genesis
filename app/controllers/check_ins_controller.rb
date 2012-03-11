class CheckInsController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    @venue = CheckIn.first(:auth_code => params[:auth_code]) || not_found
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    if @customer.nil?
      respond_to do |format|
        #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => true, :data => { :msg => [""] } } }
      end
      return
    end
    authorize! :update, @customer
    
    if !Common.within_geo_distance?(params[:latitude], params[:longitude], @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.html { render :action => "new" }
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :data => { :msg => ["Something went wrong", "Outside of check-in distance.  Please try again."] } } }
      end
      return
    end
    
    CheckIn.transaction do
      begin
        now = Time.now
        last_check_in = CheckIn.create(@venue, current_user) unless exceed_max_daily_checkins(@venue.merchant)
        challenge = Challenge.first(:type => 'checkin', :venues => Venue.all(:id => params[:venue_id]))
        if challenge && checkin_challenge_met?(challenge)
          record = EarnRewardRecord.new(
            :challenge_id => challenge.id,
            :venue_id => @venue.id,
            :points => challenge.points,
            :time => now
          )
          record.merchant = @venue.merchant
          record.user = current_user
          record.save
          @customer.points += challenge.points
        end
        @customer.last_check_in = last_check_in
        @customer.save
        data = {}
        @prizes = EarnPrize.all(EarnPrize.merchant.id => @venue.merchant.id, EarnPrize.user.id => curent_user.id, :redeemd => false)
        data[:prizes] = @prizes
        @rewards = CustomerReward.all(CustomerReward.merchant.id => @venue.merchant.id, :venues => Venue.all(:id => @venue.id), :points.lte => @customer.points)
        @rewards.push(CustomerReward.all(CustomerReward.merchant.id => @venue.merchant.id, :venues => Venue.all(:id => @venue.id), :points.gt => @customer.points, :order => [:points.asc], :offset => 0, :limit => 1))
        @eligible_rewards = []
        @rewards.each do |reward|
          item = EligibleReward.new(
            :reward_id => reward.id,
            :reward_title => reward.title,
            :points_difference => (@customer.points - reward.points).abs
          )
          @eligible_rewards << item  
        end
        data[:eligible_rewards] = @eligible_rewards
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true, :data => @customer.to_json, :meta_data => data.to_json } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :data => { :msg => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } } }
        end
      end
    end
  end
  
  private
  
  def checkin_challenge_met?(challenge)
    count = CheckIn.count(CheckIn.user.id => current_user.id, :conditions => ["venue_id IN ?", challenge.venues])
    challenge.data.visits % count == 0 ? true : false     
  end
  
  def exceed_max_daily_checkins(merchant)
    if RAILS_ENV == 'production'
      sql = "SELECT COUNT(*) FROM check_ins WHERE merchant_id = ? AND user_id = ? 
              AND CURDATE(time) = CURDATE(?)"
    else
      sql = "SELECT COUNT(*) FROM check_ins WHERE merchant_id = ? AND user_id = ? 
              AND date(time) = date(?)"        
    end
    count = DataMapper.repository(:default).adapter.select(
      sql, merchant.id, current_user.id, Time.now
    )     
    count < 2 ? false : true
  end
end