class UserDevise::RegistrationsController < Devise::RegistrationsController
  def create
    User.transaction do |t|
      begin
        build_resource
        resource[:role] = "user"
        resource[:status] = :active
        user = User.create(resource)
        resource = user
        if resource.active_for_authentication?
          set_flash_message :notice, :signed_up if is_navigational_format?
          sign_in(resource_name, resource)
          respond_to do |format|
            format.html { redirect_to redirect_location(resource_name, resource) }
            format.json { render :json => { :success => true, :data => resource.to_json } }
          end
        else
          set_flash_message :notice, :inactive_signed_up, :reason => resource.inactive_message.to_s if is_navigational_format?
          expire_session_data_after_sign_in!
          respond_to do |format|
            format.html { redirect_to after_inactive_sign_up_path_for(resource) }
            format.json { render :json => { :success => true, :data => resource.to_json } }
          end
        end  
      rescue DataMapper::SaveFailureError => e
        t.rollback
        clean_up_passwords resource
        respond_to do |format|
          format.html { redirect_to resource }
          format.json { render :json => { :success => false, :data => resource.errors.to_json } }
        end  
      rescue
        t.rollback
        clean_up_passwords resource
        respond_to do |format|
          format.html { redirect_to resource }
          format.json { render :json => { :success => false, :data => { :msg => [""] } } }
        end
      end
    end
  end
end 