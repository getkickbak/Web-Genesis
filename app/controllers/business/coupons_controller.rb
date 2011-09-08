class Business::CouponsController < Business::ApplicationController
  
  def show
    @coupon = Coupon.first(:coupon_id => params[:id])
    #authorize! :read, @coupon

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @coupon }
    end
  end

  def redeem
    @coupon = Coupon.first(:coupon_id => params[:id])
    #authorize! :update, Coupon

    begin
      @coupon[:redeemed] = true
      @coupon.save
      respond_to do |format|
        format.json { render :json => { :success => false } }
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      @coupon = e.resource
      respond_to do |format|
        format.json { render :json => { :success => false } }
      end
    end
  end

end