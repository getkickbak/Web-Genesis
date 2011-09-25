class DealsController < ApplicationController
  before_filter :authenticate_user!, :only => [:edit, :update]
  #load_and_authorize_resource
  
  def index
    authorize! :read, Merchant
    
    merchant_id = params[:merchant_id]
    start = 0
    max = 10
    @merchant = Merchant.first(:merchant_id => merchant_id)
    @deals = Deal.find(@merchant.id, start, max) || not_found
 
    respond_to do |format|
      format.html # index.html.erb
      #format.xml  { render :xml => @deals }
    end
  end

  def show
    if params[:merchant_id]
      @merchant = Merchant.first(:merchant_id => params[:merchant_id])
    end
    if params[:id]
      @deal = Deal.first(:deal_id => params[:id]) || not_found
    else
      @deal = Deal.get(1)
    end    
    authorize! :read, @deal  
    
    if params[:referral_id]
      @referral = Referral.first(:referral_id => params[:referral_id])
    elsif signed_in?
      @referral = Referral.first(:deal_id => @deal.id, :creator_id => current_user.id)  
    end
    
    if params[:id]
      respond_to do |format|
        format.html # show.html.erb
        #format.xml  { render :xml => @deal }
      end
    else
      respond_to do |format|
        format.html { redirect_to deal_path(@deal) }
      end
    end
  end

  def new
    authorize! :create, Deal

    @merchant = Merchant.first(:merchant_id => params[:merchant_id])
    @deal = Deal.new

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
    authorize! :create, Deal

    Deal.transaction do
      begin
        @merchant = Merchant.first(params[:merchant_id])
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
    Deal.transaction do
      begin
        @merchant = Merchant.first(params[:merchant_id])
        @deal = Deal.first(params[:id]) || not_found
        authorize! :update, @deal

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

  def get_referrals
    @deal = Deal.first(:deal_id => params[:id]) || not_found
    authorize! :read, @deal

    start = params[:start].to_i
    max = params[:max].to_i
    result = Referral.find_by_deal(@deal.id, start, max)

    respond_to do |format|
      format.json { render :json => { :success => true, :data => result[:items].to_json(:only => [:photo_url, :comment, :created_ts], :methods => [:creator]), :total => result[:total] } }
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
