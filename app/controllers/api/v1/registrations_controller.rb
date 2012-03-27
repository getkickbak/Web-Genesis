class Api::V1::RegistrationsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    User.transaction do
      begin
        params[:user][:role] = "user"
        params[:user][:status] = :active
        @user = User.create(params[:user])
        @customers = Customer.all(Customer.user.id => @user.id)
        render :json => { :success => true, :data => @customers.to_json, :metaData => @user.to_json(:only => [:authentication_token]) }
      rescue DataMapper::SaveFailureError => e
        render :json => { :success => false, :metaData => e.resource.errors.to_json }
      rescue
        render :json => { :success => false, :messasge => [""] }
      end
    end
  end
end 