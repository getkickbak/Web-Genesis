module Business
  class MerchantsController < BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_is_admin, :only => [:photo, :update_photo, :update_alt_photo] 
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

      begin
        Merchant.transaction do
          params[:merchant][:status] = @merchant.status
          params[:merchant][:role] = @merchant.role
          params[:merchant][:will_terminate] = @merchant.will_terminate
          params[:merchant][:custom_badges] = @merchant.custom_badges
          @merchant.update_all(@merchant.type, @merchant.visit_frequency, params[:merchant])
          sign_in(current_merchant, :bypass => true)
          respond_to do |format|
            format.html { redirect_to(:action => "edit", :notice => t("business.merchants.update_success")) }
          #format.xml  { head :ok }
          end
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
      
      begin
        Merchant.transaction do
          @merchant.update_photo(params[:merchant])
          respond_to do |format|
            format.html { redirect_to(:action => "photo", :notice => t("business.merchants.update_photo_success")) }
          #format.xml  { head :ok }
          end
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
    
    def update_alt_photo
      @merchant = current_merchant  
      authorize! :update, @merchant
      
      begin
        Merchant.transaction do
          @merchant.update_alt_photo(params[:merchant])
          respond_to do |format|
            format.html { redirect_to(:action => "photo", :notice => t("business.merchants.update_photo_success")) }
            #format.xml  { head :ok }
          end
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