module Business
  class InvoicesController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_status
    
    def index
      authorize! :read, Invoice
       @invoices = Invoice.all(:merchant => current_merchant, :order => [:created_ts.desc]).paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @invoice = Invoice.get(params[:id]) || not_found
      authorize! :read, @invoice

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
  end
end