class DealsController < ApplicationController
  # GET /deals
  # GET /deals.xml
  def index
    merchant_id = params[:merchant_id]
    start = 0
    max = 10 
    @merchant = MerchantService.instance.get_merchant(merchant_id)
    @deals = DealService.instance.get_deals(merchant_id, start, max)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @deals }
    end
  end

  # GET /deals/1
  # GET /deals/1.xml
  def show
    if params[:merchant_id]
      @merchant = MerchantService.instance.get_merchant(params[:merchant_id])
    end
    @deal = DealService.instance.get_deal(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @deal }
    end
  end

  # GET /deals/new
  # GET /deals/new.xml
  def new
    @merchant = MerchantService.instance.get_merchant(params[:merchant_id])
    @deal = Deal.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @deal }
    end
  end

  # GET /deals/1/edit
  def edit
    @merchant = MerchantService.instance.get_merchant(params[:merchant_id])
    @deal = DealService.instance.get_deal(params[:id])
  end

  # POST /deals
  # POST /deals.xml
  def create
    Deal.transaction do
      begin
        @merchant = MerchantService.instance.get_merchant(params[:merchant_id])
        @deal = DealService.instance.create_deal(@merchant, params[:deal])
        respond_to do |format|
          format.html { redirect_to merchant_deal_path(@merchant, @deal, :notice => 'Deal was successfully created.') }
          format.xml  { render :xml => @deal, :status => :created, :location => @deal }
          format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @deal = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end

  # PUT /deals/1
  # PUT /deals/1.xml
  def update
    Deal.transaction do
      begin
        @merchant = MerchantService.instance.get_merchant(params[:merchant_id])
        @deal = DealService.instance.get_deal(params[:id])
        DealService.instance.update_deal(@deal, params[:deal])
        respond_to do |format|
          format.html { redirect_to merchant_deal_path(@merchant, @deal, :notice => 'Deal was successfully updated.') }
          format.xml  { head :ok }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @deal = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end

  # DELETE /deals/1
  # DELETE /deals/1.xml
  def destroy
    @deal = DealService.instance.get_deal(params[:id])
    @deal.destroy

    respond_to do |format|
      format.html { redirect_to(deals_url) }
      format.xml  { head :ok }
    end
  end
end
