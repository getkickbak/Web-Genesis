module Business
  class BaseApplicationController < ApplicationController
    helper TabsOnRails::ActionController::HelperMethods
    
    protected
    
    def current_ability
      @current_ability ||= MerchantAbility.new(current_merchant)
    end
  end
end