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
  
  def create
    @venue = Venue.get(params[:venue_id]) || not_found
    authorize! :create, Customer
    
    Customer.transaction do
      begin
        if @venue.authorization_codes.first(:auth_code => params[:auth_code])
          @customer = Customer.create(@venue.merchant, current_user)
          render :template => '/api/v1/customers/create'
        else
          respond_to do |format|
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
            format.json { render :json => { :success => false, :message => [t("api.customers.create_failure")] } }
          end 
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.customers.create_failure")] } }
        end
      end
    end  
  end
end