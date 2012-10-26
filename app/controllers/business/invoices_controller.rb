module Business
  class InvoicesController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status
    before_filter :check_is_admin
    
    def index
      authorize! :read, Invoice
      @invoices = Invoice.all(:merchant => current_merchant)

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @invoice = Invoice.first(:invoice_id => params[:id]) || not_found
      authorize! :read, @invoice

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
  end
end