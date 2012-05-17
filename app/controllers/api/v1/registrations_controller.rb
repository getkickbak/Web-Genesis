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
        if user_info.include? :facebook_id
          existing_user = User.first(:facebook_id => user_info[:facebook_id])
          if !existing_user.nil?
            respond_to do |format|
              #format.xml  { head :ok }
              format.json { render :json => { :success => false, :message => t("api.facebook_account_already_exists_failure").split(' ') } }
            end
            return  
          end
        end
        @user = User.create(user_info)
        @results = Customer.find(@user.id, start, max)
        @earn_prizes = []
        render :template => '/api/v1/tokens/create'     
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :metaData => { :rescode => 'signup_invalid_info' }, :message => e.resource.errors } }
        end  
      rescue
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.registrations.create_failure").split(' ') } }
        end  
      end
    end
  end
end 