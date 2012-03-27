module Business
  class CouponsController < BaseApplicationController
    before_filter :authenticate_merchant!
    set_tab :coupons
    
    def index
      authorize! :read, Coupon

      if params[:search]
        @coupon = Coupon.first(:coupon_id => params[:search])
        if @coupon
        @subdeal = Subdeal.get(@coupon.order.subdeal_id)
        end
      end
    end

    def show
      @coupon = Coupon.first(:coupon_id => params[:id]) || not_found
      authorize! :read, @coupon

      respond_to do |format|
        format.json  { render :json => { :success => true, :data => @coupon } }
      end
    end

    def redeem
      @coupon = Coupon.first(:coupon_id => params[:id]) || not_found
      authorize! :update, @coupon

      if @coupon.expiry_date >= (Date.today - 7)
        error_msg = "Error redeeming voucher.  Please try again."
        flash[:error] = error_msg
        respond_to do |format|
          format.html { redirect_to coupons_path+"?search=#{params[:id]}" }
          format.json { render :json => { :success => false, :msg => error_msg } }
        end
      end

      Coupon.transaction do
        begin
          @coupon[:redeemed] = true
          @coupon[:update_ts] = Time.now
          @coupon.save
          msg = "Voucher# #{@coupon.coupon_id} has been successfully redeemed."
          flash[:notice] = msg
          respond_to do |format|
            format.html { redirect_to coupons_path+"?search=#{params[:id]}" }
            format.json { render :json => { :success => true, :msg => msg } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          error_msg = "Error redeeming voucher.  Please try again."
          flash[:error] = error_msg
          respond_to do |format|
            format.html { redirect_to coupons_path+"?search=#{params[:id]}" }
            format.json { render :json => { :success => false, :msg => error_msg } }
          end
        end
      end
    end
  end
end