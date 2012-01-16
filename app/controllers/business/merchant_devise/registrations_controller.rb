module Business
  class MerchantDevise::RegistrationsController < Devise::RegistrationsController
    def new
      super
    end

    def create
      Merchant.transaction do |t|
        begin
          build_resource
          merchant = Merchant.create(resource, resource.password, resource.password_confirmation)
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
        rescue StandardError => e
          t.rollback
          clean_up_passwords(resource)
          respond_with_navigational(resource) { render_with_scope :new }
        end
      end
    end

    def update
      self.resource = resource_class.to_adapter.get!(send(:"current_#{resource_name}").to_key)

      if resource.update_with_password(params[resource_name])
        set_flash_message :notice, :updated if is_navigational_format?
        sign_in resource_name, resource, :bypass => true
        respond_with resource, :location => after_update_path_for(resource)
      else
        clean_up_passwords(resource)
        respond_with_navigational(resource){ render_with_scope :edit }
      end
    end
  end
end