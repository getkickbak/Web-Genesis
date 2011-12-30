module Admin
  class JobsController < ApplicationController
    before_filter :authenticate_user!
    
    def index
      authorize! :manage, :all

    end

    def run
      authorize! :manage, :all

      begin
        if params[:payments]
          error_msg = "Voucher Payments Job failed."
          Resque.enqueue(VoucherPayments,false)
          flash[:notice] = "You have successfully run the Voucher Payments Job."
        elsif params[:payments_capture]
          error_msg = "Voucher Payments Capture Job failed."
          Resque.enqueue(ClinicVoucherPayments)
          flash[:notice] = "You have successfully run the Voucher Payments Capture Job."
        end  
        elsif params[:reminders]
          error_msg = "Voucher Reminders Job failed"
          Resque.enqueue(VoucherReminders)
          flash[:notice] = "You have successfully run the Voucher Reminders Job."
        end
        respond_to do |format|
          format.html { redirect_to admin_jobs_path }
        end
      rescue StandardError
        flash[:error] = error_msg
        respond_to do |format|
          format.html { redirect_to admin_jobs_path }
        end
      end
    end
  end
end