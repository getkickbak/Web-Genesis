class UsersController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource

  def edit
    @user = current_user
    authorize! :update, @user
  end

  def update
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        params[:user][:role] = @user.role
        params[:user][:status] = @user.status
        @user.update_all(params[:user])
        respond_to do |format|
          format.html { redirect_to({:action => "edit"}, {:notice => t("users.update_success")}) }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
        end
      end
    end
  end

  def password
    @user = current_user
    authorize! :update, @user  
  end
  
  def update_password
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        @user.update_password(params[:user])
        sign_in(current_user, :bypass => true)
        respond_to do |format|
          format.html { redirect_to({:action => "password"}, {:notice => t("users.update_password_success")}) }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "password" }
        end
      end
    end
  end
  
  def facebook_settings
    @user = current_user
    authorize! :read, @user

    respond_to do |format|
      format.html # show.html.erb
    #format.xml  { render :xml => @user }
    end
  end

  def update_facebook_info
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        facebook_id = user_info[:facebook_id]
        existing_user = nil
        if facebook_id.to_s != "0"
          facebook_auth = ThirdPartyAuth.first(:provider => "facebook", :uid_id => facebook_id)
        existing_user = facebook_auth ? facebook_auth.user : existing_user
        end
        if existing_user.nil? || (existing_user.id == current_user.id)
          @user.update_facebook_info(:provider => "facebook", :uid_id => facebook_id)
          if params[:gender] && params[:birthday]
            profile_info = {
              :gender => params[:gender],
              :birthday => params[:birthday]
            }
            @user.profile.update(profile_info)
            @user.save
          end
          respond_to do |format|
          #format.xml  { head :ok }
            format.json { render :json => { :success => true, :message => t("users.update_facebook_info_success").split('\n') } }
          end
        else
          respond_to do |format|
          #format.xml  { head :ok }
            format.json { render :json => { :success => true, :message => t("users.facebook_account_already_exists_failure").split('\n') } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @user = e.resource
        respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => e.resource.errors } }
        end
      end
    end
  end

  def subscriptions
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        if @user.subscription.nil?
          Subscription.create(@user)
        end
        respond_to do |format|
          format.html # show.html.erb
          #format.xml  { render :xml => @user }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        raise e 
      end
    end
  end

  def update_email_notif
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        @user.subscription.email_notif = !params[:value].to_bool
        @user.save
        respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => true } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => e.resource.errors } }
        end 
      end
    end
  end
end
