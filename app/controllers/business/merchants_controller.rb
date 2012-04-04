module Business
  class MerchantsController < BaseApplicationController
    before_filter :authenticate_merchant!
    #load_and_authorize_resource
    
    def show
      @merchant = current_merchant
      authorize! :read, @merchant  
      
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def edit
      @merchant = current_merchant
      authorize! :read, @merchant
    end
    
    def update
      @merchant = current_merchant
      authorize! :update, @merchant

      Merchant.transaction do
        begin
          params[:merchant][:status] = @merchant.status
          @merchant.update_all(@merchant.type, params[:merchant])
          sign_in(current_merchant, :bypass => true)
          respond_to do |format|
            format.html { redirect_to(:action => "show", :notice => t("business.merchants.update_success")) }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          respond_to do |format|
            format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end
    
    def photo
      @merchant = current_merchant  
      authorize! :read, @merchant  
      
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def update_photo
      @merchant = current_merchant  
      authorize! :update, @merchant
      
      Merchant.transaction do
        begin
          @merchant.update_photo(params[:merchant])
          respond_to do |format|
            format.html { redirect_to(:action => "photo", :notice => t("business.merchants.update_photo_success")) }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          respond_to do |format|
            format.html { render :action => "photo" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end
    
    def update_alt_photo
      @merchant = current_merchant  
      authorize! :update, @merchant
      
      Merchant.transaction do
        begin
          @merchant.update_alt_photo(params[:merchant])
          respond_to do |format|
            format.html { redirect_to(:action => "photo", :notice => t("business.merchants.update_photo_success")) }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          respond_to do |format|
            format.html { render :action => "photo" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end
  end
end