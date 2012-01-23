module Business
  class DashboardController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    
    def index
      if current_merchant.status == :pending
        respond_to do |format|
          format.html { redirect_to setup_path }
        end
      else
        respond_to do |format|
          format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
        end
      end
    end
  end
end