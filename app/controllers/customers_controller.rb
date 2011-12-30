class CustomersController < ApplicationController
  before_filter :authenticate_user!, :only => [:edit, :update, :destroy]
  #load_and_authorize_resource
   
  def index
    authorize! :read, Customer

    start = 0
    max = 10
    results = Customer.find(current_user.id, start, max)

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => { :success => true, :data => results[:items].to_json(:only => [:points], :methods => [:merchant]), :total => results[:total] } }
    end
  end  
  
  def show
    @merchant = Merchant.first(:merchant_id => params[:merchant_id]) || not_found
    @customer = Customer.all(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :read, @customer
     
    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => { :success => true, :data => @customer.to_json(:only => [:qr_code]) } }
    end
  end
end