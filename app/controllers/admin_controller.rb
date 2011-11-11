class AdminController < ApplicationController
  before_filter :authenticate_user!
  def index
    authorize! :manage, :all

  end

  def run
    authorize! :manage, :all

    begin
      if params[:payments]
        error_msg = "Voucher Payments Job failed."
        VoucherPayments.perform(false)
        flash[:notice] = "You have successfully run the Voucher Payments Job."
      elsif params[:reminders]
        error_msg = "Voucher Reminders Job failed"
        VoucherReminders.perform()
        flash[:notice] = "You have successfully run the Voucher Reminders Job."
      end
      respond_to do |format|
        format.html { redirect_to admin_path }
      end
    rescue StandardError
      flash[:error] = error_msg
      respond_to do |format|
        format.html { redirect_to admin_path }
      end
    end
  end
end