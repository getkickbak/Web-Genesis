module Admin
  class DevicesController < BaseApplicationController
    before_filter :authenticate_staff!
    
    def index
      authorize! :read, Device

      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @devices = Device.all(:order => [:created_ts.desc]).paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @device = Device.get(params[:device_id]) || not_found
      authorize! :read, @device

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def new
      authorize! :create, Device
      @device = Device.new

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def edit
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @device = Device.get(params[:device_id]) || not_found
      authorize! :update, @device      
    end

    def create
      authorize! :create, Device

      begin
        Device.transaction do
          @device = Device.create(params[:device])
          respond_to do |format|
            format.html { redirect_to(merchant_device_path(@device), :notice => t("admin.devices.create_success")) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @device = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end

    def update
      @device = Device.get(params[:device_id]) || not_found
      authorize! :update, @device

      begin
        Device.transaction do
          @device.update(params[:device])
          respond_to do |format|
            format.html { redirect_to(merchant_device_path(@device), :notice => t("admin.devices.update_success")) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @device = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end

    def destroy
      @device = Device.get(params[:device_id]) || not_found
      authorize! :destroy, @device

      @device.destroy

      respond_to do |format|
        format.html { redirect_to(devices_url) }
      #format.xml  { head :ok }
      end
    end
  end
end