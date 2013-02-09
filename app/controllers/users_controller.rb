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

    begin
      User.transaction do
        params[:user][:role] = @user.role
        params[:user][:status] = @user.status
        @user.update_all(params[:user])
        respond_to do |format|
          format.html { redirect_to({:action => "edit"}, {:notice => t("users.update_success")}) }
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      @user = e.resource
      respond_to do |format|
        format.html { render :action => "edit" }
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

    begin
      User.transaction do
        @user.update_password(params[:user])
        sign_in(current_user, :bypass => true)
        respond_to do |format|
          format.html { redirect_to({:action => "password"}, {:notice => t("users.update_password_success")}) }
        end
      end  
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      @user = e.resource
      respond_to do |format|
        format.html { render :action => "password" }
      end
    end
  end
  
  def facebook_settings
    @user = current_user
    authorize! :read, @user

    if session["devise.facebook_data"]
      begin
        User.transaction do
          data = session["devise.facebook_data"] && session["devise.facebook_data"].extra.raw_info
          @user.update_facebook_auth({:provider => "facebook", :uid => data.id, :token => session["devise.facebook_data"].credentials.token})
          gender = (data.gender == "male" ? :m : :f) if data.gender
          birthday = Date.strptime(data.birthday, '%m/%d/%Y') if data.birthday
          profile_info = {
            :gender => gender,
            :birthday => birthday
          }
          @user.profile.update(profile_info)
          @user.save
          session.delete "devise.facebook_data"
        end    
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:error] = t("users.update_facebook_info_failure")
        respond_to do |format|
          format.html { render :action => "facebook_settings" }
        end
        return
      end
    end
    respond_to do |format|
      format.html # show.html.erb
      #format.xml  { render :xml => @user }
    end
  end

  # This is used in case we decide to support ajax Facebook update in the future
  def update_facebook_info
    @user = current_user
    authorize! :update, @user

    begin
      User.transaction do
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
            format.json { render :json => { :success => true, :message => t("users.update_facebook_info_success").split(/\n/) } }
          end
        else
          respond_to do |format|
          #format.xml  { head :ok }
            format.json { render :json => { :success => true, :message => t("users.facebook_account_already_exists_failure").split(/\n/) } }
          end
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

  def facebook_disconnect
    @user = current_user
    authorize! :read, @user

    begin
      User.transaction do
        @user.facebook_auth.destroy
        respond_to do |format|
          format.html { redirect_to({:action => "facebook_settings"}, {:notice => t("users.facebook_disconnect_success")}) }
        end  
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      flash[:error] = t("errors.messages.exception.http_500")
      respond_to do |format|
        format.html { render :action => "facebook_settings" }
      end
    end
  end
  
  def subscriptions
    @user = current_user
    authorize! :update, @user

    begin
      User.transaction do
        if @user.subscription.nil?
          Subscription.create(@user)
        end
        respond_to do |format|
          format.html # show.html.erb
          #format.xml  { render :xml => @user }
        end
      end    
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      raise e 
    end
  end

  def update_email_notif
    @user = current_user
    authorize! :update, @user

    begin
      User.transaction do
        @user.subscription.email_notif = !params[:value].to_bool
        @user.save
        respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => true } }
        end
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("users.update_email_notif_failure") } }
      end 
    end
  end
end
