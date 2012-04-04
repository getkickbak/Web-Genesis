require 'dm-rails/middleware/identity_map'



class ApplicationController < ActionController::Base
  use Rails::DataMapper::Middleware::IdentityMap
  protect_from_forgery
  check_authorization :unless => :devise_controller?
  before_filter :set_cache_buster
  layout :layout_by_resource
  
  def layout_by_resource
    if !Domain.matches?(request)
      if request.subdomain == 'merchant'
        "business/application"
      else
        "admin/application"
      end
    else
      "application"
    end
  end
  
  def set_cache_buster
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end
  
  unless Rails.application.config.consider_all_requests_local
    rescue_from Exception, :with => :render_error
    rescue_from Exceptions::AppException, :with => :render_error
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
    handle_error([t("errors.messages.exceptions.404")], "/error/404.html.erb", :status => 404)
  end

  def render_error(exception)
    logger.error(exception)
    handle_error([t("errors.messages.exceptions.500")], "/error/500.html.erb", :status => 500)
  end
  
  def handle_error(message, template, params)
    error = {
      :success => false,
      :message => message
    }
    status = params[:status] || :not_found
    respond_to do |format|
      format.html { render :template => template, :status => status }
      format.xml  { render :xml  => error.to_xml, :status => status }
      format.json { render :json => error.to_json, :status => status }
      format.yaml { render :text => error.to_yaml, :status => status }
    end
  end
end
