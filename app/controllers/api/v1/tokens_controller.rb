class Api::V1::TokensController < ApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!, :only => [:get_csrf_token]
  skip_authorization_check
  respond_to :json
  
  def create
    auth_token = params[Devise.token_authentication_key]
    if auth_token.nil?
      email = params[:email]
      password = params[:password]
      if email.nil? or password.nil?
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.tokens.create_missing_info").split('\n') } }
        end  
        return  
      else
        @user = User.first(:email => email.downcase, :status => :active) 
      end
    else
      @user = User.first(:authentication_token => auth_token, :status => :active)  
    end

    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.create_invalid_info").split('\n') } }
      end  
      return
    end

    @user.ensure_authentication_token!
    @user.save!

    if auth_token.nil? && (not @user.valid_password?(password))
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.create_invalid_info").split('\n') } }
      end  
    else
      start = params[:start].to_i
      max = params[:limit].to_i
      @results = Customer.find(@user.id, start, max) 
      if params[:device] && params[:device] != "null"
        device_info = JSON.parse(params[:device], { :symbolize_names => true })
        Common.register_user_device(@user, device_info)
      end
      render :template => '/api/v1/tokens/create'
    end
  end

  def create_from_facebook
    create_user = false
    facebook_id = params[:facebook_id]
    auth_token = params[Devise.token_authentication_key]
    #logger.debug("auth_token: #{auth_token}")
    #logger.debug("facebook_id: #{params[:facebook_id]}")
    if auth_token.nil?
      if facebook_id.nil? || facebook_id == "0"
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.tokens.create_missing_facebook_info").split('\n') } }
        end  
        return
      end
      @user = User.first(:facebook_id => facebook_id, :status => :active)
      if @user.nil?
        @user = User.first(:email => params[:email], :status => :active)
      end
    else
      @user = User.first(:authentication_token => auth_token, :status => :active)  
      if @user.nil?
        if facebook_id && User.first(:facebook_id => facebook_id, :status => :active)
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :metaData => { :rescode => 'login_invalid_info' }, :message => t("api.tokens.create_invalid_info").split('\n') } }
          end  
          return  
        end
      end
    end
    
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'login_invalid_facebook_info' }, :message => t("api.tokens.create_invalid_facebook_info").split('\n') } }
      end  
      return
    end
    
    begin
      User.transaction do
        if facebook_id
          @user.update_without_password(:facebook_id => facebook_id, :facebook_email => params[:facebook_email] || "", :update_ts => Time.now)
          if params[:gender] && params[:birthday]
            profile_info = {
              :gender => params[:gender],
              :birthday => params[:birthday]
            }
            @user.profile.update(profile_info)
          end
          @user.ensure_authentication_token!
          @user.save!
        end
        start = params[:start].to_i
        max = params[:limit].to_i
        @results = Customer.find(@user.id, start, max) 
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
        format.json { render :json => { :success => false, :metaData => { :rescode => 'server_error' }, :message => t("api.tokens.create_from_facebook_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'server_error' }, :message => t("api.tokens.create_from_facebook_failure").split('\n') } }
      end
    end      
  end

  def get_csrf_token    
    render :template => '/api/v1/tokens/get_csrf_token'
  end
  
  def destroy
    @user = User.first(:authentication_token => params[:id])
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.destroy_failure").split('\n') } }
      end  
    else
      @user.reset_authentication_token!
      sign_out(@user)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => true } }
      end  
    end
  end
end