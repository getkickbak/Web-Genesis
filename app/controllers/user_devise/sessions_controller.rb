class UserDevise::SessionsController < Devise::SessionsController
  
  # POST /resource/sign_in
  def create
    resource = warden.authenticate!(:scope => resource_name, :recall => "#{controller_path}#new")
    set_flash_message(:notice, :signed_in) if is_navigational_format?
    sign_in(resource_name, resource)
    respond_to do |format|
      format.html { redirect_back_or(root_path) }
      format.json { render :json => { :success => true } }
    end
  end
  
  def create_from_facebook
    User.transaction do
      begin
        user = User.first(:facebook_id => params[:facebook_id])
        if user.nil?
          user = User.create(params)
          flash[:notice] = "Hi #{user.name.split(' ')[0]}, Welcome to JustForMyFriends."
        else
          account_info = {
            :name => params[:name],
            :email => params[:email]
          }
          user.update(account_info)
          profile_info = {
            :gender => params[:gender],
            :birthday => params[:birthday]
          }
          user.profile.update(profile_info)
        end      
        resource = user
        sign_in(resource_name, resource)
        respond_to do |format|
          format.html { redirect_back_or(root_path) }
          format.json { render :json => { :success => true } }
        end
      rescue
        respond_to do |format|
          format.html { redirect_back_or(root_path) }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end
end
