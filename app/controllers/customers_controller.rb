class CustomersController < ApplicationController
  before_filter :authenticate_user!, :only => [:edit, :update, :destroy]
  #load_and_authorize_resource
   
  def index
    authorize! :read, Customer

    results = Customer.find(current_user.id, params[:start], params[:max])

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => { :success => true, :data => results[:items].to_json, :total => results[:total] } }
    end
  end
  
  def create
    @venue = Venue.get(params[:venue_id]) || not_found
    authorize! :create, Customer
    
    Customer.transaction do
      begin
        if @venue.auth_code == params[:auth_code]
          @customer = Customer.create(@venue.merchant, current_user)
          success = true
          msg = [""]
          data = @customer.to_json
        else
          success = false
          msg = [""]   
          data = { :msg => msg }
        end
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => success, :data => data } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :data => { :msg => ["Something went wrong", "Please try again."] } } }
        end
      end
    end  
  end
end