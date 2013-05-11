module Admin
  class VenuesController < Admin::BaseApplicationController
    before_filter :authenticate_staff!
    
    def index
      authorize! :read, Venue

      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @venues = @merchant.venues.paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def edit
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue      
      
    end
    
    def update
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      begin
        Venue.transaction do
          @venue.update(:device_type => params[:venue][:device_type], :update_ts => Time.now)
          respond_to do |format|
            format.html { redirect_to(merchant_venues_path(@merchant), :notice => t("admin.venues.update_success")) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @venue = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end
  end
end