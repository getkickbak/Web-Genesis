class Api::V1::RegistrationsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    #Note: Temporary to stop people to signing up
    if Rails.env == 'production'
      respond_to do |format|
        #format.xml  { head :ok }
        format.json { render :json => { :success => false, :message => t("api.not_available").split('\n') } }
      end
      return      
    end
    
    begin
      User.transaction do
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
              format.json { render :json => { :success => false, :message => t("api.facebook_account_already_exists_failure").split('\n') } }
            end
            return  
          end
        end
        @user = User.create(user_info)
        @results = Customer.find(@user.id, start, max)
        @earn_prizes = []
        if params[:device] && params[:device] != "null"
          device_info = JSON.parse(params[:device], { :symbolize_names => true })
          Common.register_user_device(@user, device_info)
        end
        render :template => '/api/v1/tokens/create'     
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'signup_invalid_info' }, :message => e.resource.errors } }
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.registrations.create_failure").split('\n') } }
      end  
    end        
  end
end 