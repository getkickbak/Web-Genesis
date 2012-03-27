class Api::V1::TokensController < ApplicationController 
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    email = params[:email]
    password = params[:password]
    
    if email.nil? or password.nil? 
      render :json => { :success => false, :message => ["The request must contain the user email and password."] }
      return
    end
    
    @user = User.first(:email => email.downcase)
    
    if @user.nil?
      render :json => { :success => false, :message => ["Invalid email or passoword."] }
      return
    end
    
    @user.ensure_authentication_token!
    @user.save!
    
    if not @user.valid_password?(password) 
      render :json => { :success => false, :message => ["Invalid email or passoword."] }
    else
      @customers = Customer.all(Customer.user.id => @user.id)
      render :json => { :success => true, :data => @customers.to_json, :metaData => { :auth_token => @user.authentication_token } }
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
        @customers = Customer.all(Customer.user.id => @user.id)
        render :json => { :success => true, :data => @customers.to_json, :metaData => { :auth_token => @user.authentication_token } }
      rescue DataMapper::SaveFailureError => e
        render :json => { :success => false }  
      rescue
        render :json => { :success => false }
      end
    end
  end
  
  def destroy
    @user = User.first(:authentication_token => params[:id]) 
    if @user.nil?
      render :json => { :success => false, :message => ["Invalid token."] }
    else
      @user.reset_authentication_token!
      render :json => { :success => true }
    end
  end  
end