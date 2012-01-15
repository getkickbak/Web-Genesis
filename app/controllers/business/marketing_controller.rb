module Business
  class MarketingController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    
    def index
    end
  end
end