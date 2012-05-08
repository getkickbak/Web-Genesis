class Api::V1::TokensController < ApplicationController
  skip_before_filter :verify_authenticity_token
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
          format.json { render :json => { :success => false, :message => [t("api.tokens.create_missing_info")] } }
        end  
        return  
      else
        @user = User.first(:email => email.downcase) 
      end
    else
      @user = User.first(:authentication_token => auth_token)  
    end

    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.tokens.create_invalid_info")] } }
      end  
      return
    end

    @user.ensure_authentication_token!
    @user.save!

    if auth_token.nil? && (not @user.valid_password?(password))
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.tokens.create_invalid_info")] } }
      end  
    else
      start = params[:start].to_i
      max = params[:limit].to_i
      @results = Customer.find(@user.id, start, max)
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => @user.id, :expiry_ts.gte => Time.now, :redeemed => false)
      render :template => '/api/v1/tokens/create'
    end
  end

  def create_from_facebook
    auth_token = params[Devise.token_authentication_key]
    if auth_token.nil?
      facebook_id = params[:facebook_id]
      if facebook_id.nil?
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => [t("api.tokens.create_missing_facebook_info")] } }
        end  
        return
      end
      @user = User.first(:facebook_id => facebook_id)
    else
      @user = User.first(:authentication_token => auth_token)  
    end
    
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'login_invalid_facebook_info' }, :message => [t("api.tokens.create_invalid_facebook_info")] } }
      end  
      return
    end
    
    User.transaction do
      begin
        profile_info = {
          :gender => params[:gender],
          :birthday => params[:birthday]
        }
        @user.profile.update(profile_info)
        @user.ensure_authentication_token!
        @user.save!
        start = params[:start].to_i
        max = params[:limit].to_i
        @results = Customer.find(@user.id, start, max)
        @earn_prizes = EarnPrize.all(EarnPrize.user.id => @user.id, :expiry_ts.gte => Time.now, :redeemed => false)
        render :template => '/api/v1/tokens/create'
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :metaData => { :rescode => 'server_error' }, :message => [t("api.tokens.create_from_facebook_failure")] } }
        end
      rescue
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :metaData => { :rescode => 'server_error' }, :message => [t("api.tokens.create_from_facebook_failure")] } }
        end
      end
    end
  end

  def destroy
    @user = User.first(:authentication_token => params[:id])
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => [t("api.tokens.destroy_failure")] } }
      end  
    else
      @user.reset_authentication_token!
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => true } }
      end  
    end
  end
end