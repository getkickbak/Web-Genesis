class Api::V1::VenuesController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource

  def show
    @venue = Venue.get(params[:id]) || not_found
    authorize! :read, @venue
    
    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.venue.id => @venue.id)
    data = {}
    if @customer
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
    end 
    respond_to do |format|
      format.json { render :json => { :success => true, :data => @customer, :metaData => data.to_json } }
    end  
  end
  
  def find_nearest
    authorize! :read, Venue

    @venues = Venue.find_nearest(params[:merchant_id], params[:latitude], params[:longitude], params[:max])
    respond_to do |format|
      format.json { render :json => { :success => true, :data => @venues } }
    end
  end
end