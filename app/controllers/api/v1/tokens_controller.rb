class Api::V1::TokensController < ApplicationController 
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    email = params[:email]
    password = params[:password]
    
    if email.nil? or password.nil? 
      render :json => { :success => false, :message => [t("api.tokens.create_missing_info")] }
      return
    end
    
    @user = User.first(:email => email.downcase)
    
    if @user.nil?
      render :json => { :success => false, :message => [t("api.tokens.create_invalid_info")] }
      return
    end
    
    @user.ensure_authentication_token!
    @user.save!
    
    if not @user.valid_password?(password) 
      render :json => { :success => false, :message => [t("api.tokens.create_invalid_info")] }
    else
      start = params[:start].to_i
      max = params[:limit].to_i
      @results = Customer.find(@user.id, start, max)
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => @user.id, :redeemed => false)
      render :template => '/api/v1/tokens/create'
    end
  end
  
  def create_from_facebook
    User.transaction do
      begin
        @user = User.first(:facebook_id => params[:facebook_id])
        if @user.nil?
          @user = User.create_from_facebook(params)
        else
          account_info = {
            :name => params[:name],
            :email => params[:email]
          }
          @user.update(account_info)
          profile_info = {
            :gender => params[:gender],
            :birthday => params[:birthday]
          }
          @user.profile.update(profile_info)
        end      
        start = params[:start].to_i
        max = params[:limit].to_i
        @results = Customer.find(@user.id, start, max)
        @earn_prizes = EarnPrize.all(EarnPrize.user.id => @user.id, :redeemed => false)
        render :template => '/api/v1/tokens/create'
      rescue DataMapper::SaveFailureError => e
        render :json => { :success => false, :message => [t("api.tokens.create_from_facebook_failure")] }  
      rescue
        render :json => { :success => false, :message => [t("api.tokens.create_from_facebook_failure")] }
      end
    end
  end
  
  def destroy
    @user = User.first(:authentication_token => params[:id]) 
    if @user.nil?
      render :json => { :success => false, :message => [t("api.tokens.destroy_failure")] }
    else
      @user.reset_authentication_token!
      render :json => { :success => true }
    end
  end  
end