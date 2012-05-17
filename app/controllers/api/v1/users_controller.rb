class Api::V1::UsersController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_user!

  def update
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        user_info = JSON.parse(params[:user], { :symbolize_names => true })
        user_info[:role] = @user.role
        user_info[:status] = @user.status
        @user.update_all(user_info)
        sign_in(current_user, :bypass => true)
        respond_to do |format|
          #format.xml  { head :ok }
          format.json { render :json => { :success => true } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :metaData => { :rescode => 'update_account_invalid_info' }, :message => e.resource.errors } }
        end
      end
    end
  end
  
  def update_facebook_info
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        user_info = JSON.parse(params[:user], { :symbolize_names => true })
        facebook_id = user_info[:facebook_id]
        facebook_email = user_info[:facebook_email]
        existing_user = User.first(:facebook_id => facebook_id)
        if existing_user.nil? || (existing_user.id == current_user.id)
          @user.update_without_password(:facebook_id => facebook_id, :facebook_email => facebook_email, :update_ts => Time.now)
          respond_to do |format|
            #format.xml  { head :ok }
            format.json { render :json => { :success => true } }
          end
        else
          respond_to do |format|
            #format.xml  { head :ok }
            format.json { render :json => { :success => false, :message => t("api.facebook_account_already_exists_failure").split('\n') } }
          end  
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :metaData => { :rescode => 'update_account_invalid_facebook_info' }, :message => e.resource.errors } }
        end
      end
    end
  end    
end
