class UsersController < ApplicationController
  before_filter :authenticate_user!, :only => [:edit, :update, :destroy]
  #load_and_authorize_resource
   
  def index
    authorize! :read, User

    start = 0
    max = 10
    @users = User.find(start, max)

    respond_to do |format|
      format.html # index.html.erb
      #format.xml  { render :xml => @users }
    end
  end

  def show
    @user = User.first(params[:id]) || not_found
    authorize! :read, @user

    respond_to do |format|
      format.html # show.html.erb
      #format.xml  { render :xml => @user }
    end
  end

  def new
    @user = User.new
    authorize! :create, @user

    respond_to do |format|
      format.html # new.html.erb
      #format.xml  { render :xml => @user }
    end
  end

  def edit
    @user = User.first(params[:id]) || not_found
    authorize! :update, @user
  end

  def create
    authorize! :create, User

    User.transaction do
      begin
        @user = User.create(params[:user])
        sign_in(@user)
        respond_to do |format|
          format.html { redirect_to(@user, :notice => 'User was successfully created.') }
          #format.xml  { render :xml => @user, :status => :created, :location => @user }
          #format.json { render :json => { :success => true, :data => @user, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end
    end
  end

  def update
    User.transaction do
      begin
        @user = User.first(params[:id]) || not_found
        authorize! :update, @user

        @user.update(params[:user])
        respond_to do |format|
          format.html { redirect_to(@user, :notice => 'User was successfully updated.') }
          #format.xml  { head :ok }
          #format.json { render :json => { :success => true, :data => @user, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end
    end
  end

  def destroy
    @user = User.get(params[:id]) || not_found
    authorize! :destroy, @user
   
    @user.destroy

    respond_to do |format|
      format.html { redirect_to(users_url) }
      #format.xml  { head :ok }
    end
  end
    
end
