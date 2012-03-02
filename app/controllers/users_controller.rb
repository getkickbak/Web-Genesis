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
          format.html { redirect_to(account_path, :notice => 'User was successfully updated.') }
          #format.xml  { head :ok }
          format.json { render :json => { :success => true, :data => { :msg => [""] } } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :data => { :msg => e.resource.errors.to_json } } }
        end
      end
    end
  end    
end
