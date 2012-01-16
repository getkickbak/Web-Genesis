module Admin
  class BaseApplicationController < ApplicationController
    
    protected
    
    def current_ability
      @current_ability ||= StaffAbility.new(current_staff)
    end
  end
end