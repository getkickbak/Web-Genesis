class AdminController < ApplicationController
  before_filter :authenticate_user!
  def index
    authorize! :manage, :all

  end

  def run
    authorize! :manage, :all
    if params[:payments]
      VoucherPayments.perform(false)
      flash[:notice] = "You have successfully run the Voucher Payments Job"
    elsif params[:reminders]
      VoucherReminders.perform()
      flash[:notice] = "You have successfully run the Voucher Reminders Job"
    end
    respond_to do |format|
      format.html { redirect_to admin_path }
    end
  end
end