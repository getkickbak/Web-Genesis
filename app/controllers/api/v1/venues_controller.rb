class Api::V1::VenuesController < ApplicationController
  before_filter :authenticate_user!
  
  def explore
    @venue = Venue.get(params[:id]) || not_found
    authorize! :read, @venue

    @customer = Customer.first(Customer.merchant.id => @venue.merchant.id, Customer.user.id => current_user.id)
    is_customer = true
    if @customer.nil?
      @customer = Customer.new
      @customer.id = 0
      @customer.points = 0
      is_customer = false
    end
    @eligible_rewards = []
=begin    
    if is_customer
      @rewards = CustomerReward.all(CustomerReward.merchant.id => @venue.merchant.id, :venues => Venue.all(:id => @venue.id), :points.lte => @customer.points)
      @rewards.concat(CustomerReward.all(CustomerReward.merchant.id => @venue.merchant.id, :venues => Venue.all(:id => @venue.id), :points.gt => @customer.points, :order => [:points.asc], :offset => 0, :limit => 1))
    else
      @rewards = []  
    end  
    @eligible_rewards = []
    @rewards.each do |reward|
      item = EligibleReward.new(
        reward.id,
        reward.type.value,
        reward.title,
        (@customer.points - reward.points).abs
      )
      @eligible_rewards << item
    end
=end    
    render :template => '/api/v1/check_ins/create'
  end

  def find_nearest
    authorize! :read, Venue

    merchant_id = params[:merchant_id]
    latitude = params[:latitude].to_f
    longitude = params[:longitude].to_f
    max = params[:limit].to_i
    @venues = Venue.find_nearest(merchant_id, latitude, longitude, max)
    render :template => '/api/v1/venues/find_nearest'
  end
end