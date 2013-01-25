class VenuesController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource
  
  def show
    @venue = Venue.get(params[:id]) || not_found
    authorize! :read, @venue
    
    @customer = Customer.first(:user => current_user, :merchant => @venue.merchant) || not_found
    @customer_rewards = CustomerReward.all(:merchant => @venue.merchant)

    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @merchants }
    end
  end
end