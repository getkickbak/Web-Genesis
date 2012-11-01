module Business
  class MerchantDevise::SessionsController < Devise::SessionsController
    after_filter :clear_flash, :only => [:create, :destroy]

    protected
    
    def clear_flash
      if flash.keys.include?(:notice)
        flash.delete(:notice)
      end
    end
  end
end