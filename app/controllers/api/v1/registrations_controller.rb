class Api::V1::RegistrationsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    User.transaction do
      begin
        params[:user][:role] = "user"
        params[:user][:status] = :active
        start = params[:start].to_i
        max = params[:limit].to_i
        @user = User.create(params[:user])
        @results = Customer.find(@user.id, start, max)
        render :template => '/api/v1/tokens/create'
      rescue DataMapper::SaveFailureError => e
        render :json => { :success => false, :metaData => e.resource.errors }
      rescue
        render :json => { :success => false, :messasge => [t("api.registrations.create_failure")] }
      end
    end
  end
end 