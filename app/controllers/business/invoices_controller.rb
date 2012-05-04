module Business
  class InvoicesController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Invoice
      @invoices = Invoice.all(Invoice.merchant.id => current_merchant.id)

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