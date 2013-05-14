require 'dm-rails/middleware/identity_map'



class ApplicationController < ActionController::Base
  use Rails::DataMapper::Middleware::IdentityMap
  protect_from_forgery
  check_authorization :unless => :devise_controller?
  before_filter :secure_with_ssl
  before_filter :set_cache_buster
  layout :layout_by_resource
  
  def layout_by_resource
    if !Domain.matches?(request)
      if request.subdomain == 'merchant'
        "business/application"
      elsif request.subdomain == "manage"
        "admin/application"
      else
        "application"  
      end
    else
      if (devise_controller? || signed_in?) && !request.fullpath.match(/terms|privacy/) || request.fullpath.match(/business\/.$/)
        "alt_application"
      else  
        "application"
      end
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
    rescue_from CanCan::AccessDenied, :with => :render_unauthorized
    rescue_from ActionController::RoutingError, :with => :render_not_found
    rescue_from ActionController::UnknownController, :with => :render_not_found
    rescue_from ActionController::UnknownAction, :with => :render_not_found
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end
  
  def log_request_header
    logger.warn "*** BEGIN RAW REQUEST HEADERS ***"
    self.request.env.each do |header|
      logger.warn "HEADER KEY: #{header[0]}"
      logger.warn "HEADER VAL: #{header[1]}"
    end
    logger.warn "*** END RAW REQUEST HEADERS ***"
  end
  
  def show_session_data
    logger.warn "*** BEGIN RAW SESSION DATA ***"
    logger.warn session.inspect
    logger.warn "*** END RAW SESSION DATA ***"
  end

  private

  def secure_with_ssl
    if Rails.env.production?
      if request.subdomain == 'www' || request.subdomain == ''
        redirect_to :protocol => 'http'
      elsif request.subdomain == 'manage' && request.protocol != 'https://'
        redirect_to :protocol => 'https'
      elsif request.subdomain == 'merchant'
        if (request.fullpath == '/sign_in' || request.fullpath.match(/^\/invoices(.)*$/)) && request.protocol != 'https://'
          redirect_to :protocol => 'https'
        elsif request.fullpath != '/sign_in' && request.protocol == 'https://'
          redirect_to :protocol => 'http'
        end  
      end
    end
  end
  
  def get_template
    template = "/error/error.html.erb"
    if !Domain.matches?(request)
      if request.subdomain == 'merchant'
        template = "/error/business/error.html.erb"
      else
        template = "/error/admin/error.html.erb"
      end
    end
    return template  
  end
  
  def render_unauthorized(exception)
    handle_error(t("errors.messages.exception.http_401_headline"), t("errors.messages.exception.http_401").split(/\n/), get_template, :status => 401)  
  end
  
  def render_not_found(exception)
    handle_error(t("errors.messages.exception.http_404_headline"), t("errors.messages.exception.http_404").split(/\n/), get_template, :status => 404)
  end

  def render_error(exception)
    logger.error(exception)
    handle_error(t("errors.messages.exception.http_500_headline"), t("errors.messages.exception.http_500").split(/\n/), get_template, :status => 500)
  end
  
  def handle_error(headline, message, template, params)
    error = {
      :success => false,
      :message => message
    }
    status = params[:status] || :not_found
    respond_to do |format|
      format.html { render :template => template, :locals => { :headline => headline, :messages => message }, :status => status }
      format.xml  { render :xml  => error.to_xml, :status => status }
      format.json { render :json => error.to_json, :status => status }
      format.yaml { render :text => error.to_yaml, :status => status }
    end
  end
end
