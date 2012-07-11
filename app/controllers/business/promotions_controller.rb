module Business
  class PromotionsController < BaseApplicationController
    before_filter :authenticate_merchant!

    def index
      authorize! :read, Promotion
      @promotions = Promotion.all(Promotion.merchant.id => current_merchant.id)

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, Promotion

      @promotion = Promotion.new
      today = Date.today
      @promotion.start_date = today
      @promotion.end_date = today
      
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def create
      authorize! :create, Promotion

      begin
        Promotion.transaction do
          promotion = Promotion.create(current_merchant, params[:promotion])
          Resque.enqueue(CreatePromotion, promotion.id)
          respond_to do |format|
            format.html { redirect_to promotions_path(:notice => t("business.promotion.create_success")) }
          #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
          #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @promotion = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
        #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
        #format.json { render :json => { :success => false } }
        end
      end
    end
  end
end