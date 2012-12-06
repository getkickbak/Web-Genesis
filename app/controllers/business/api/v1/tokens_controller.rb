class Business::Api::V1::TokensController < Business::Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_merchant!, :only => [:get_csrf_token]
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
          format.json { render :json => { :success => false, :message => t("business.api.tokens.create_missing_info").split('\n') } }
        end  
        return  
      else
        @merchant = Merchant.first(:email => email.downcase) 
      end
    else
      @merchant = Merchant.first(:authentication_token => auth_token)  
    end

    if @merchant.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("business.api.tokens.create_invalid_info").split('\n') } }
      end  
      return
    end

    @merchant.ensure_authentication_token!
    @merchant.save!

    if auth_token.nil? && (not @merchant.valid_password?(password))
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("business.api.tokens.create_invalid_info").split('\n') } }
      end  
    else
      render :template => '/business/api/v1/tokens/create'
    end
  end

  def get_csrf_token    
    session[:user_agent] = Common.get_user_agent(request.env['HTTP_USER_AGENT'])
    session[:resolution] = Common.get_thumbail_resolution(session[:user_agent], params[:device_pixel_ratio].to_f)
    render :template => '/api/v1/tokens/get_csrf_token'
  end
  
  def destroy
    @merchant = Merchant.first(:authentication_token => params[:id])
    if @merchant.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("business.api.tokens.destroy_failure").split('\n') } }
      end  
    else
      @merchant.reset_authentication_token!
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => true } }
      end  
    end
  end
end