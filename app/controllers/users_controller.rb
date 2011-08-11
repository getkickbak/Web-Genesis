class UsersController < ApplicationController
  before_filter :authenticate, :only => [:edit, :update]
   
  # GET /users
  # GET /users.xml
  def index
    @users = User.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @users }
    end
  end

  # GET /users/1
  # GET /users/1.xml
  def show
    @user = UserService.instance.get_user(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /users/new
  # GET /users/new.xml
  def new
    @user = User.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /users/1/edit
  def edit
    @user = UserService.instance.get_user(params[:id])
  end

  # POST /users
  # POST /users.xml
  def create
    User.transaction do
      begin
        @user = UserService.instance.create_user(params[:user])
        sign_in(@user)
        respond_to do |format|
          format.html { redirect_to(@user, :notice => 'User was successfully created.') }
          format.xml  { render :xml => @user, :status => :created, :location => @user }
          format.json { render :json => { :success => true, :data => @user, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end

  # PUT /users/1
  # PUT /users/1.xml
  def update
    User.transaction do
      begin
        @user = UserService.instance.get_user(params[:id])
        UserService.instance.update_user(@user, params[:user])
        respond_to do |format|
          format.html { redirect_to(@user, :notice => 'User was successfully updated.') }
          format.xml  { head :ok }
          format.json { render :json => { :success => true, :data => @user, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @user = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.xml
  def destroy
    @user = UserService.instance.get_user(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to(users_url) }
      format.xml  { head :ok }
    end
  end
  
  private
  
    def authenticate
      deny_access unless signed_in?
    end
    
end
