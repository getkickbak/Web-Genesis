class UserDevise::SessionsController < Devise::SessionsController  
  after_filter :clear_flash, :only => [:create, :destroy]
  
  # POST /resource/sign_in
  def create
    self.resource = warden.authenticate!(auth_options)
    set_flash_message(:notice, :signed_in) if is_navigational_format?
    sign_in(resource_name, resource)
    respond_with resource, :location => after_sign_in_path_for(resource)
  end
  
  def create_from_facebook
    begin
      User.transaction do
        facebook_auth = ThirdPartyAuth.first(:provider => "facebook", :uid => params[:facebook_id])
        if facebook_auth.nil?
          raise Exception.new
        end
        user = facebook_auth.user
        profile_info = {
          :gender => params[:gender],
          :birthday => params[:birthday]
        }
        user.profile.update(profile_info)   
        resource = user
        sign_in(resource_name, resource)
        respond_with resource, :location => after_sign_in_path_for(resource)
      end
    rescue DataMapper::SaveFailureError => e
      respond_with resource, :location => after_sign_in_path_for(resource)  
    rescue
      respond_with resource, :location => after_sign_in_path_for(resource)
    end    
  end
  
  # DELETE /resource/sign_out
  def destroy
    redirect_path = after_sign_out_path_for(resource_name)
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    set_flash_message :notice, :signed_out if signed_out

    # We actually need to hardcode this as Rails default responder doesn't
    # support returning empty response on GET request
    respond_to do |format|
      format.any(*navigational_formats) { redirect_to redirect_path }
      format.json { render :json => { :success => true } }
      format.html do
        method = "to_#{request_format}"
        text = {}.respond_to?(method) ? {}.send(method) : ""
        render :text => text, :status => :ok
      end
    end
  end

  protected
  
  def clear_flash
    if flash.keys.include?(:notice)
      flash.delete(:notice)
    end
  end
end