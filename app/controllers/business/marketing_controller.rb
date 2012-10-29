module Business
  class MarketingController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status
    before_filter :check_is_admin
    skip_authorization_check
    def index
      @venues = current_merchant.venues
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def create_sign_up_code
      @merchant = current_merchant
      authorize! :update, @merchant

      begin
        Merchant.transaction do
          @merchant.create_sign_up_code()
          respond_to do |format|
            format.html { redirect_to({:action => "index"}, {:notice => t("business.merchants.create_sign_up_code_success")}) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          format.html { redirect_to({:action => "index"}, {:error => t("business.merchants.create_sign_up_code_failure")}) }
        #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
  end
end