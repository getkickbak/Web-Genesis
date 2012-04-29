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
end