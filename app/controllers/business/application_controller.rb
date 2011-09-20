require 'dm-rails/middleware/identity_map'

module Business
  class ApplicationController < ActionController::Base
    use Rails::DataMapper::Middleware::IdentityMap
    protect_from_forgery
    include SessionsHelper
    #check_authorization :unless => :devise_controller?

    def current_ability
      @current_ability ||= MerchantAbility.new(current_merchant)
    end
  end
end