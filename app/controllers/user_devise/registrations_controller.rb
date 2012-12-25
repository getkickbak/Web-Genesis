class UserDevise::RegistrationsController < Devise::RegistrationsController
  
  # GET /resource/sign_up
  def new
    @user = build_resource({})
    respond_with @user
  end
  
  def create
    begin
      User.transaction do  
        params[:user][:role] = "user"
        params[:user][:status] = :active
        resource = User.create(params[:user])
        if resource.active_for_authentication?
          set_flash_message :notice, :signed_up if is_navigational_format?
          sign_in(resource_name, resource)
          respond_with resource, :location => after_sign_up_path_for(resource)
        else
          set_flash_message :notice, :inactive_signed_up, :reason => resource.inactive_message.to_s if is_navigational_format?
          expire_session_data_after_sign_in!
          respond_with resource, :location => after_inactive_sign_up_path_for(resource)
        end    
      end
    rescue DataMapper::SaveFailureError => e
      @user = e.resource
      clean_up_passwords(@user)  
      respond_with @user
    end    
  end
end 