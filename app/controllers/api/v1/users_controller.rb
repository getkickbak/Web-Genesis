class Api::V1::UsersController < ApplicationController
  before_filter :authenticate_user!

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
          #format.xml  { head :ok }
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
  
  def update_facebook_info
    @user = current_user
    authorize! :update, @user

    User.transaction do
      begin
        @user.update_without_password(params[:facebook_id], params[:facebook_email], :update_ts => now)
        respond_to do |format|
          #format.xml  { head :ok }
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
