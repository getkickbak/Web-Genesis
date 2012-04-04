module Admin
  class MerchantsController < BaseApplicationController
    before_filter :authenticate_staff!
    
    def index
      authorize! :read, Merchant

      @merchants = Merchant.all(:order => [:created_ts.desc]).paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :read, @merchant

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def new
      authorize! :create, Merchant
      @merchant = Merchant.new

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def edit
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :update, @merchant
      
      @merchant.type_id = @merchant.type.id
    end

    def create
      authorize! :create, Merchant

      Merchant.transaction do
        begin
          params[:merchant][:status] = :pending
          type = MerchantType.get(params[:merchant][:type_id])
          params[:merchant][:prize_terms] = I18n.t 'prize.terms'
          @merchant = Merchant.create(type, params[:merchant])
          respond_to do |format|
            format.html { redirect_to(merchant_path(@merchant), :notice => t("admin.merchants.create_success")) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          @merchant.type_id = params[:merchant][:type_id]
          respond_to do |format|
            format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end

    def update
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :update, @merchant

      Merchant.transaction do
        begin
          type = MerchantType.get(params[:merchant][:type_id])
          @merchant.update_all(type, params[:merchant])
          respond_to do |format|
            format.html { redirect_to(merchant_path(@merchant), :notice => t("admin.merchants.update_success")) }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          @merchant.type_id = params[:merchant][:type_id]
          respond_to do |format|
            format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end

    def destroy
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :destroy, @merchant

      @merchant.destroy

      respond_to do |format|
        format.html { redirect_to(merchants_url) }
      #format.xml  { head :ok }
      end
    end
  end
end