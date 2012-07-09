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
          format.json { render :json => { :success => false, :message => t("api.tokens.create_missing_info").split('\n') } }
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
      @earn_prizes = EarnPrize.all(EarnPrize.user.id => @user.id, :expiry_date.gte => Date.today, :redeemed => false, :order => [:expiry_date.asc])
      merchant_ids = []
      reward_ids = []
      @earn_prizes.each do |prize|
        merchant_ids << prize.merchant.id
        reward_ids << prize.reward.id
      end
      merchant_id_to_type_id = {}
      merchant_to_types = MerchantToType.all(:fields => [:merchant_id, :merchant_type_id], :merchant_id => merchant_ids)
      merchant_to_types.each do |merchant_to_type|
        merchant_id_to_type_id[merchant_to_type.merchant_id] = merchant_to_type.merchant_type_id
      end
      reward_id_to_type_id = {}
      reward_to_types = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_type_id], :customer_reward_id => reward_ids)
      reward_to_types.each do |reward_to_type|
        reward_id_to_type_id[reward_to_type.customer_reward_id] = reward_to_type.customer_reward_type_id
      end
      @earn_prizes.each do |prize|
        prize.merchant.eager_load_type = MerchantType.id_to_type[merchant_id_to_type_id[prize.merchant.id]]
        prize.reward.eager_load_type = CustomerRewardType.id_to_type[reward_id_to_type_id[prize.reward.id]]
      end 
      Common.register_user_device(@user, params[:device])
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
      if facebook_id.nil?
        respond_to do |format|
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.tokens.create_missing_facebook_info").split('\n') } }
        end  
        return
      end
      @user = User.first(:facebook_id => facebook_id)
      if @user.nil?
        @user = User.first(:email => params[:email])
      end
    else
      @user = User.first(:authentication_token => auth_token)  
      if @user.nil?
        if facebook_id && User.first(:facebook_id => facebook_id)
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
        profile_info = {
          :gender => params[:gender],
          :birthday => params[:birthday]
        }
        if facebook_id
          @user.update_without_password(:facebook_id => facebook_id, :facebook_email => params[:facebook_email])
        end
        @user.profile.update(profile_info)
        @user.ensure_authentication_token!
        @user.save!
        start = params[:start].to_i
        max = params[:limit].to_i
        @results = Customer.find(@user.id, start, max)
        @earn_prizes = EarnPrize.all(EarnPrize.user.id => @user.id, :expiry_date.gte => Date.today, :redeemed => false, :order => [:expiry_date.asc])
        merchant_ids = []
        reward_ids = []
        @earn_prizes.each do |prize|
          merchant_ids << prize.merchant.id
          reward_ids << prize.reward.id
        end
        merchant_id_to_type_id = {}
        merchant_to_types = MerchantToType.all(:fields => [:merchant_id, :merchant_type_id], :merchant_id => merchant_ids)
        merchant_to_types.each do |merchant_to_type|
          merchant_id_to_type_id[merchant_to_type.merchant_id] = merchant_to_type.merchant_type_id
        end
        reward_id_to_type_id = {}
        reward_to_types = CustomerRewardToType.all(:fields => [:customer_reward_id, :customer_reward_type_id], :customer_reward_id => reward_ids)
        reward_to_types.each do |reward_to_type|
          reward_id_to_type_id[reward_to_type.customer_reward_id] = reward_to_type.customer_reward_type_id
        end
        @earn_prizes.each do |prize|
          prize.merchant.eager_load_type = MerchantType.id_to_type[merchant_id_to_type_id[prize.merchant.id]]
          prize.reward.eager_load_type = CustomerRewardType.id_to_type[reward_id_to_type_id[prize.reward.id]]
        end 
        Common.register_user_device(@user, params[:device])
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

  def destroy
    @user = User.first(:authentication_token => params[:id])
    if @user.nil?
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.tokens.destroy_failure").split('\n') } }
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