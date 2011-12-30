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
          @merchant.update(params[:merchant])
          sign_in(current_merchant, :bypass => true)
          respond_to do |format|
            format.html { redirect_to(:action => "show", :notice => 'Merchant was successfully updated.') }
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
    
    def update_qr_code
      @merchant = current_merchant
      authorize! :update, @merchant

      Merchant.transaction do
        begin
          @merchant.update_qr_code()
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @merchant.merchant_id, :notice => 'Merchant successfully generated a new QR code.') }
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
  end
end