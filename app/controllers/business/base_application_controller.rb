module Business
  class BaseApplicationController < ApplicationController
    helper TabsOnRails::ActionController::HelperMethods
    
    protected
    
    def current_ability
      @current_ability ||= MerchantAbility.new(current_merchant)
    end
    
    def check_status
      if current_merchant.status == :pending
        respond_to do |format|
          format.html { redirect_to setup_path }
        end
      end
    end
    
    def check_is_admin
      if session[:is_admin].nil? || (not session[:is_admin])
        respond_to do |format|
          format.html { redirect_to dashboard_path }
        end
      end
    end
  end
end