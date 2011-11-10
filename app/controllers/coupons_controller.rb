class CouponsController < ApplicationController
  before_filter :authenticate_user!
  
  def show
    @coupon = Coupon.first(:coupon_id => params[:id]) || not_found
    authorize! :read, @coupon

    respond_to do |format|
      format.json  { render :json => { :success => true, :data => @coupon.to_json } }
    end
  end

  def template
    authorize! :manage, :all
    @coupon = Coupon.first(:coupon_id => params[:id])

    @order = @coupon.order
    @coupon_id = @coupon.coupon_id
    @coupon_title = @coupon.coupon_title
    @qr_code = @coupon.qr_code
    respond_to do |format|
      format.html { render :template => "user_mailer/voucher_template" }
    #format.xml  { render :xml => @order }
    end
  end

  def reminder_email
    authorize! :manage, :all
    coupon = Coupon.first(:coupon_id => params[:id])
    @user = coupon.user
    @coupons = [coupon]
    respond_to do |format|
      format.html { render :template => "user_mailer/voucher_reminder_email" }
    #format.xml  { render :xml => @order }
    end
  end
end