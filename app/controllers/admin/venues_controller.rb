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
      
      @features_config = @venue.features_config
      if @features_config.nil?
        VenueFeaturesConfig.create(@venue, @merchant.features_config)
      end
      @features_config = @venue.features_config
    end
    
    def update_device_type
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      begin
        Venue.transaction do
          @venue.update(:device_type => params[:venue][:device_type], :update_ts => Time.now)
          respond_to do |format|
            format.html { redirect_to(merchant_venues_path(@merchant), :notice => t("admin.venues.update_device_type_success")) }
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
    
    def update_pos_config
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      begin
        VenueFeaturesConfig.transaction do
          if !params[:venue_features_config][:enable_pos].to_bool
            params[:venue_features_config][:enable_sku_data_upload] = false
          end
          @venue.features_config.update(params[:venue_features_config])
          respond_to do |format|
            format.html { redirect_to(merchant_venues_path(@merchant), :notice => t("admin.venues.update_pos_config_success")) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @features_config = @venue.features_config
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
  end
end