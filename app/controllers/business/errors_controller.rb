module Business
  class ErrorsController < Business::BaseApplicationController
    def routing
      not_found
    end
  end
end