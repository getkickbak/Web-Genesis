require 'dm-rails/middleware/identity_map'

class ApplicationController < ActionController::Base
  use Rails::DataMapper::Middleware::IdentityMap
  protect_from_forgery
  include SessionsHelper
  #check_authorization :unless => :devise_controller?
  before_filter :set_cache_buster
  
  def set_cache_buster
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end
  
  unless Rails.application.config.consider_all_requests_local
    rescue_from Exception, :with => :render_error
    rescue_from Exceptions::AppException, :with => :render_app_error
    rescue_from CanCan::AccessDenied, :with => :render_not_found
    rescue_from ActionController::RoutingError, :with => :render_not_found
    rescue_from ActionController::UnknownController, :with => :render_not_found
    rescue_from ActionController::UnknownAction, :with => :render_not_found
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end

  private

  def render_not_found(exception)
    respond_to do |format|
      format.html { render :template => "/error/404.html.erb", :status => 404 }
      format.json { render :json => { :success => false, :msg => ['Something went wrong', 'Please try again.'] } }
    end
  end

  def render_error(exception)
    logger.error(exception)
    respond_to do |format|
      format.html { render :template => "/error/500.html.erb", :status => 500 }
      format.json { render :json => { :success => false, :msg => ['Something went wrong', 'Server Error.'] } }
    end
  end

  def render_app_error(exception)
    logger.error(exception)
    respond_to do |format|
      format.html { render :template => "/error/500.html.erb", :status => 500 }
      format.json { render :json => { :success => false, :msg => ['Something went wrong', exception.message] } }
    end
  end
end
