module Business
  class MerchantDevise::RegistrationsController < Devise::RegistrationsController
    def create
      begin
        Merchant.transaction do
          build_resource
          resource[:role] = "merchant"
          resource[:status] = :pending
          merchant = Merchant.create(resource)
          resource = merchant
          if resource.active_for_authentication?
            set_flash_message :notice, :signed_up if is_navigational_format?
            sign_in(resource_name, resource)
            respond_with resource, :location => redirect_location(resource_name, resource)
          else
            set_flash_message :notice, :inactive_signed_up, :reason => resource.inactive_message.to_s if is_navigational_format?
            expire_session_data_after_sign_in!
            respond_with resource, :location => after_inactive_sign_up_path_for(resource)
          end
        end
      rescue DataMapper::SaveFailureError => e
        resource = e.resource
        clean_up_passwords(resource)
        respond_with resource
      rescue StandardError => e
        clean_up_passwords(resource)
        respond_with resource
      end    
    end
  end
end