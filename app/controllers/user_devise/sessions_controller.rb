class UserDevise::SessionsController < Devise::SessionsController  
  # POST /resource/sign_in
  
  def create_from_facebook
    User.transaction do
      begin
        user = User.first(:facebook_id => params[:facebook_id])
        if user.nil?
          user = User.create_from_facebook(params)
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
          format.html { redirect_to after_sign_in_path_for(resource) }
        end
      rescue DataMapper::SaveFailureError => e
        respond_to do |format|
          format.html { redirect_to after_sign_in_path_for(resource) }
        end  
      rescue
        respond_to do |format|
          format.html { redirect_to after_sign_in_path_for(resource) }
        end
      end
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
end