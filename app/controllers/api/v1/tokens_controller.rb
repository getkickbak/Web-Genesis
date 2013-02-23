class Api::V1::TokensController < Api::V1::BaseApplicationController
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
          format.json { render :json => { :success => false, :message => t("api.tokens.create_missing_info").split(/\n/) } }
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
        format.json { render :json => { :success => false, :message => t("api.tokens.create_invalid_info").split(/\n/) } }
      end  
      return
    end

    begin
      User.transaction do
        @user.ensure_authentication_token!
        @user.save!
        if auth_token.nil? && (not @user.valid_password?(password))
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :message => t("api.tokens.create_invalid_info").split(/\n/) } }
          end  
        else  
          reset_session
          start = params[:start].to_i
          max = params[:limit].to_i
          @results = Customer.find(@user.id, start, max) 
          if params[:device] && (params[:device] != "null")
            device_info = JSON.parse(params[:device], { :symbolize_names => true })
            Common.register_user_device(@user, device_info)
          end
          session[:user_agent] = Common.get_user_agent(request.env['HTTP_USER_AGENT'])
          session[:resolution] = Common.get_thumbail_resolution(session[:user_agent], params[:device_pixel_ratio].to_f)
          render :template => '/api/v1/tokens/create'
        end
      end
    rescue DataMapper::SaveFailureError => e  
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.create_failure").split(/\n/) } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.create_failure").split(/\n/) } }
      end
    end   
  end

  def create_from_facebook
    create_user = false
    facebook_id = params[:facebook_id]
    auth_token = params[Devise.token_authentication_key]
    #logger.debug("auth_token: #{auth_token}")
    #logger.debug("facebook_id: #{params[:facebook_id]}")
    if auth_token.nil?
      if facebook_id.nil? || facebook_id.to_s == "0"
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.tokens.create_missing_facebook_info").split(/\n/) } }
        end  
        return
      end
      facebook_auth = ThirdPartyAuth.first(:provider => "facebook", :uid => facebook_id)
      @user = facebook_auth ? facebook_auth.user : nil
      if @user.nil?
        @user = User.first(:email => params[:email], :status => :active)
      end
    else
      @user = User.first(:authentication_token => auth_token, :status => :active)  
      if @user.nil?
        if facebook_id && ThirdPartyAuth.first(:provider => "facebook", :uid => facebook_id)
          respond_to do |format|
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
            format.json { render :json => { :success => false, :metaData => { :rescode => 'login_invalid_info' }, :message => t("api.tokens.create_invalid_info").split(/\n/) } }
          end  
          return  
        end
      end
    end
    
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'login_invalid_facebook_info' }, :message => t("api.tokens.create_invalid_facebook_info").split(/\n/) } }
      end  
      return
    end
    
    begin
      User.transaction do
        if facebook_id
          @user.update_facebook_auth({:provider => "facebook", :uid => facebook_id, :token => params[:accessToken]})
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
        reset_session
        start = params[:start].to_i
        max = params[:limit].to_i
        @results = Customer.find(@user.id, start, max) 
        if params[:device] && (params[:device] != "null")
          device_info = JSON.parse(params[:device], { :symbolize_names => true })
          Common.register_user_device(@user, device_info)
        end
        session[:user_agent] = Common.get_user_agent(request.env['HTTP_USER_AGENT'])
        session[:resolution] = Common.get_thumbail_resolution(session[:user_agent], params[:device_pixel_ratio].to_f)
        render :template => '/api/v1/tokens/create'
      end
    rescue DataMapper::SaveFailureError => e  
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'server_error' }, :message => t("api.tokens.create_from_facebook_failure").split(/\n/) } }
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'server_error' }, :message => t("api.tokens.create_from_facebook_failure").split(/\n/) } }
      end
    end      
  end

  def get_csrf_token
    if params[:device] && (params[:device] != "null")
      device_info = JSON.parse(params[:device], { :symbolize_names => true })
      Common.register_user_device(current_user, device_info)
    end
    session[:user_agent] = Common.get_user_agent(request.env['HTTP_USER_AGENT'])
    session[:resolution] = Common.get_thumbail_resolution(session[:user_agent], params[:device_pixel_ratio].to_f)
    render :template => '/api/v1/tokens/get_csrf_token'
  end
  
  def destroy
    @user = User.first(:authentication_token => params[:id])
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.destroy_failure").split(/\n/) } }
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