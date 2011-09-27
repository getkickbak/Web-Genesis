module Business
  class CouponsController < ApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Coupon
    end

    def show
      @coupon = Coupon.first(:coupon_id => params[:id]) || not_found
      authorize! :read, @coupon

      respond_to do |format|
        format.html # show.html.erb
        format.json  { render :json => { :success => true, :data => @coupon.to_json } }
      end
    end

    def redeem
      @coupon = Coupon.first(:coupon_id => params[:id]) || not_found
      authorize! :update, Coupon

      begin
        @coupon[:redeemed] = true
        @coupon.save
        respond_to do |format|
          format.json { render :json => { :success => true } }
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
end