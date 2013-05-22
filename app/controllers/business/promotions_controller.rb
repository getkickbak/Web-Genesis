module Business
  class PromotionsController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status

    def index
      authorize! :read, Promotion
      @promotions = Promotion.all(:merchant => current_merchant, :order => [ :created_ts.desc ], :offset => 0, :limit => 10)

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, Promotion

      segment = CustomerSegment.id_to_value[params[:segment_id].to_i]
      @promotion = Promotion.new
      today = Date.today
      @promotion.start_date = today
      @promotion.end_date = today
      @plan_id = current_merchant.payment_subscription.plan_id
      if segment
        @promotion.customer_segment_id = params[:segment_id].to_i
        #@promotion.customer_segment = CustomerSegment.id_to_segment[@promotion.customer_segment_id]
        @segment_count = Common.get_customer_segment_count(current_merchant, segment)
      else
        @segment_count = Common.get_customer_segment_count(current_merchant, "all")  
      end
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def create
      authorize! :create, Promotion

      customer_segment = CustomerSegment.get(params[:promotion][:customer_segment_id])
      @segment_count = Common.get_customer_segment_count(current_merchant, customer_segment.value)
      if @segment_count == 0
        flash[:error] = t("business.promotions.no_targeted_customers")
        @promotion = Promotion.new(params[:promotion])
        @plan_id = current_merchant.payment_subscription.plan_id
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
        return
      end
        
      begin
        Promotion.transaction do
          promotion = Promotion.create(current_merchant, customer_segment, params[:promotion])
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
        @plan_id = current_merchant.payment_subscription.plan_id
        respond_to do |format|
          format.html { render :action => "new" }
        #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
        #format.json { render :json => { :success => false } }
        end
      end
    end
  end
end