module Sales
  class MerchantsController < ApplicationController
    before_filter :authenticate_user!
    
    def index
      authorize! :manage, :all

      start = 0
      max = 10
      @merchants = Merchant.find(start, max)

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @merchant = Merchant.first(:merchant_id => params[:id]) || not_found
      authorize! :read, @merchant

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def new
      @merchant = Merchant.new
      authorize! :create, @merchant

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end

    def edit
      @merchant = Merchant.first(:merchant_id => params[:id]) || not_found
      authorize! :update, @merchant
    end

    def create
      authorize! :create, Merchant

      Merchant.transaction do
        begin
          @merchant = Merchant.create_without_devise(params[:merchant])
          respond_to do |format|
            format.html { redirect_to(sales_merchant_path(@merchant), :notice => 'Merchant was successfully created.') }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          respond_to do |format|
            format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end

    def update
      @merchant = Merchant.first(:merchant_id => params[:id]) || not_found
      authorize! :update, @merchant

      Merchant.transaction do
        begin
          @merchant.update(params[:merchant])
          respond_to do |format|
            format.html { redirect_to(sales_merchant_path(@merchant), :notice => 'Merchant was successfully updated.') }
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

    def destroy
      @merchant = Merchant.first(:merchant_id => params[:id]) || not_found
      authorize! :destroy, @merchant

      @merchant.destroy

      respond_to do |format|
        format.html { redirect_to(merchants_url) }
      #format.xml  { head :ok }
      end
    end
  end
end