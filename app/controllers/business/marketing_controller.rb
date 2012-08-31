module Business
  class MarketingController < BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status
    skip_authorization_check
    
    def index
      @venues = current_merchant.venues
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
  end
end