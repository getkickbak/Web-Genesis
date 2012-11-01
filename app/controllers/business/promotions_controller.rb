module Business
  class PromotionsController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status

    def index
      authorize! :read, Promotion
      @promotions = Promotion.all(:merchant => current_merchant, :order => [ :start_date.desc ], :offset => 0, :limit => 10)

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
            format.html { redirect_to({:action => "index"}, {:notice => t("business.promotions.create_success")}) }
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