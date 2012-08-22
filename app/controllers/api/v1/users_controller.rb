class Api::V1::UsersController < ApplicationController
  before_filter :authenticate_user!
  skip_authorization_check :only => :reset_password

  def update
    @user = current_user
    authorize! :update, @user

    begin
      User.transaction do
        user_info = JSON.parse(params[:user], { :symbolize_names => true })
        user_info[:role] = @user.role
        user_info[:status] = @user.status
        @user.update_all(user_info)
        sign_in(current_user, :bypass => true)
        respond_to do |format|
          #format.xml  { head :ok }
          format.json { render :json => { :success => true } }
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'update_account_invalid_info' }, :message => e.resource.errors } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.update_failure").split('\n') } }
      end 
    end    
  end
  
  def update_facebook_info
    @user = current_user
    authorize! :update, @user

    begin
      User.transaction do
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
            format.json { render :json => { :success => false, :message => t("api.users.facebook_account_already_exists_failure").split('\n') } }
          end  
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'update_account_invalid_facebook_info' }, :message => e.resource.errors } }
      end
    rescue StandardError => e  
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.update_failure").split('\n') } }
      end
    end    
  end  
  
  def reset_password
    @user = User.first(:email => params[:email])
    
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.reset_password_invalid_info").split('\n') } }
      end  
      return
    end
    
    new_password = String.random_alphanumeric(8)
    @user.reset_password!(new_password, new_password)
    UserMailer.reset_password_email(@user, new_password)
    respond_to do |format|
      #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
      format.json { render :json => { :success => true } }
    end    
  end
  
  def change_password
    @user = current_user
    authorize! :update, @user
    
    if not @user.valid_password?(params[:old_password])
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.change_password_invalid_info").split('\n') } }
      end  
      return
    end
    
    @user.reset_password!(params[:new_password], params[:new_password])
    render :template => '/api/v1/account/change_password'
  end  
end
