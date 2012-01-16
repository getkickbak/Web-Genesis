module Admin
  class DealsController < BaseApplicationController
    before_filter :authenticate_staff!
    
    def index
      authorize! :manage, :all

      merchant_id = params[:merchant_id]
      start = 0
      max = 10
      @merchant = Merchant.first(:merchant_id => merchant_id) || not_found
      @deals = Deal.find(@merchant.id, start, max) || not_found

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @deals }
      end
    end

    def new
      authorize! :create, Deal

      @merchant = Merchant.first(:merchant_id => params[:merchant_id]) || not_found
      @deal = Deal.new
      today = Date.today
      @deal.start_date = today
      @deal.end_date = today
      @deal.expiry_date = today
      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @deal }
      end
    end

    def edit
      @merchant = Merchant.first(:merchant_id => params[:merchant_id]) || not_found
      @deal = Deal.first(:deal_id => params[:id]) || not_found
      authorize! :update, @deal
    end

    def create
      @merchant = Merchant.first(:merchant_id => params[:merchant_id]) || not_found
      authorize! :create, Deal

      Deal.transaction do
        begin
        #Temporary settings
          Time.zone = "Eastern Time (US & Canada)"
          @deal = Deal.create(@merchant, params[:deal])

          respond_to do |format|
            format.html { redirect_to merchant_deal_path(@merchant, @deal, :notice => 'Deal was successfully created.') }
          #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
          #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @deal = e.resource.class.name == "Subdeal" ? e.resource.deal : e.resource
          respond_to do |format|
            format.html { render :action => "new" }
          #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
          end
        end
      end
    end

    def update
      @merchant = Merchant.first(:merchant_id => params[:merchant_id]) || not_found
      @deal = Deal.first(:deal_id =>params[:id]) || not_found
      authorize! :update, @deal

      #Temporary settings
      Time.zone = "Eastern Time (US & Canada)"
      Deal.transaction do
        begin
          @deal.update(params[:deal])
          respond_to do |format|
            format.html { redirect_to merchant_deal_path(@merchant, @deal, :notice => 'Deal was successfully updated.') }
            format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @deal = e.resource.class.name == "Subdeal" ? e.resource.deal : e.resource
          respond_to do |format|
            format.html { render :action => "edit" }
          #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
          end
        end
      end
    end

    def destroy
      @deal = Deal.first(:deal_id => params[:id]) || not_found
      authorize! :destroy, @deal

      @deal.destroy

      respond_to do |format|
        format.html { redirect_to(deals_url) }
      #format.xml  { head :ok }
      end
    end
  end
end