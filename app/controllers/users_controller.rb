class UsersController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource

  def show
    @user = current_user
    authorize! :read, @user

    respond_to do |format|
      format.html # show.html.erb
      #format.xml  { render :xml => @user }
    end
  end

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
        sign_in(current_user, :bypass => true)
        respond_to do |format|
          format.html { redirect_to({:action => "show"}, {:notice => t("users.update_success")}) }
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
  
  def update_facebook_info
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        facebook_id = user_info[:facebook_id]
        facebook_email = user_info[:facebook_email] || ""
        existing_user = (facebook_id.to_s == "0" ? nil : User.first(:facebook_id => facebook_id))
        if existing_user.nil? || (existing_user.id == current_user.id)
          @user.update_without_password(:facebook_id => facebook_id, :facebook_email => facebook_email, :update_ts => now)
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
end
