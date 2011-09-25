require 'dm-rails/middleware/identity_map'

module Business
  class ApplicationController < ActionController::Base
    use Rails::DataMapper::Middleware::IdentityMap
    protect_from_forgery
    include SessionsHelper
    #check_authorization :unless => :devise_controller?

    unless Rails.application.config.consider_all_requests_loca
      rescue_from Exception, :with => :render_error
      rescue_from ActionController::RoutingError, :with => :render_not_found
      rescue_from ActionController::UnknownController, :with => :render_not_found
      rescue_from ActionController::UnknownAction, :with => :render_not_found
    end

    def not_found
      raise ActionController::RoutingError.new('Not Found')
    end
  
    def current_ability
      @current_ability ||= MerchantAbility.new(current_merchant)
    end

    private

    def render_not_found(exception)
      logger.error(exception)
      render :template => "/error/404.html.erb", :status => 404
    end

    def render_error(exception)
      logger.error(exception)
      render :template => "/error/500.html.erb", :status => 500
    end
  end
end