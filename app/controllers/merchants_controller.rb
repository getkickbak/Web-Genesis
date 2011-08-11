class MerchantsController < ApplicationController
  # GET /merchants
  # GET /merchants.xml
  def index
    @merchants = Merchant.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @merchants }
    end
  end

  # GET /merchants/1
  # GET /merchants/1.xml
  def show
    @merchant = MerchantService.instance.get_merchant(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @merchant }
    end
  end

  # GET /merchants/new
  # GET /merchants/new.xml
  def new
    @merchant = Merchant.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @merchant }
    end
  end

  # GET /merchants/1/edit
  def edit
    @merchant = MerchantService.instance.get_merchant(params[:id])
  end

  # POST /merchants
  # POST /merchants.xml
  def create
    Merchant.transaction do
      begin
        @merchant = MerchantService.instance.create_merchant(params[:merchant])
        respond_to do |format|
          format.html { redirect_to(@merchant, :notice => 'Merchant was successfully created.') }
          format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @merchant = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
  end

  # PUT /merchants/1
  # PUT /merchants/1.xml
  def update
    Merchant.transaction do
      begin
        @merchant = MerchantService.instance.get_merchant(params[:id])
        MerchantService.instance.update_merchant(@merchant, params[:merchant])
        respond_to do |format|
          format.html { redirect_to(@merchant, :notice => 'Merchant was successfully updated.') }
          format.xml  { head :ok }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @merchant = e.resource
        respond_to do |format|
          format.html { render :action => "edit" }
          format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
  end

  # DELETE /merchants/1
  # DELETE /merchants/1.xml
  def destroy
    @merchant = MerchantService.instance.get_merchant(params[:id])
    @merchant.destroy

    respond_to do |format|
      format.html { redirect_to(merchants_url) }
      format.xml  { head :ok }
    end
  end
end
