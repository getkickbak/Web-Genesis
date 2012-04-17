class Api::V1::RegistrationsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    User.transaction do
      begin
        user_info = JSON.parse(params[:user], { :symbolize_names => true })
        user_info[:role] = "user"
        user_info[:status] = :active
        start = params[:start].to_i
        max = params[:limit].to_i
        @user = User.create(user_info)
        @results = Customer.find(@user.id, start, max)
        @earn_prizes = []
        render :template => '/api/v1/tokens/create'
      rescue DataMapper::SaveFailureError => e
        render :json => { :success => false, :metaData => { :rescode => 'signup_invalid_info' }, :message => e.resource.errors }
      rescue
        render :json => { :success => false, :message => [t("api.registrations.create_failure")] }
      end
    end
  end
end 