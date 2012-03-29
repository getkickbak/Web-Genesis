class Api::V1::CheckInsController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    if APP_PROP["DEBUG_MODE"]
      @venue = CheckInCode.first(:auth_code => params[:auth_code]).venue || not_found
    else
      @venue = Venue.first(:offset => 0, :limit => 1) || not_found
    end  
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    if @customer.nil?
      render :template => '/api/v1/check_ins/create'
      return
    end
    authorize! :update, @customer
    
    if !Common.within_geo_distance?(params[:latitude].to_f, params[:longitude].to_f, @venue.latitude, @venue.longitude)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => ["Something went wrong", "Outside of check-in distance.  Please try again."] } }
      end
      return
    end
    
    CheckIn.transaction do
      begin
        now = Time.now
        last_check_in = CheckIn.create(@venue, current_user) 
        @customer.last_check_in = last_check_in
        @customer.save
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
        render :template => '/api/v1/check_ins/create'
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end
      end
    end
  end
end