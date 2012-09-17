module Admin
  class ErrorsController < Admin::BaseApplicationController
    def routing
      not_found
    end
  end
end