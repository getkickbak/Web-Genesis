require 'dm-rails/middleware/identity_map'
class Business::ApplicationController < ActionController::Base
  use Rails::DataMapper::Middleware::IdentityMap
  protect_from_forgery
  include MerchantBusiness::SessionsHelper
  #check_authorization :unless => :devise_controller?
end