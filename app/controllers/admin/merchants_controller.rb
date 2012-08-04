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

      begin
        Merchant.transaction do
          params[:merchant][:status] = :pending
          type = MerchantType.get(params[:merchant][:type_id])
          visit_frequency = VisitFrequencyType.get(params[:merchant][:visit_frequency_id])
          params[:merchant][:reward_terms] = I18n.t 'customer_reward.terms'
          @merchant = Merchant.create(type, visit_frequency, params[:merchant])
          badges = []
          badge_types = BadgeType.all
          badge_types.each do |badge_type|
            badge = Badge.new(:visits => BadgeType.visits[@merchant.visit_frequency_type.value][badge_type.value])
            badge.type = badge_type
            badge.save
            badges << badge
          end  
          @merchant.badges.concat(badges)
          @merchant.save
          respond_to do |format|
            format.html { redirect_to(merchant_path(@merchant), :notice => t("admin.merchants.create_success")) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
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

    def update
      @merchant = Merchant.get(params[:id]) || not_found
      authorize! :update, @merchant

      begin
        Merchant.transaction do
          type = MerchantType.get(params[:merchant][:type_id])
          visit_frequency = VisitFrequencyType.get(params[:merchant][:visit_frequency_id])
          @merchant.update_all(type, visit_frequency, params[:merchant])
          respond_to do |format|
            format.html { redirect_to(merchant_path(@merchant), :notice => t("admin.merchants.update_success")) }
          #format.xml  { head :ok }
          end
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