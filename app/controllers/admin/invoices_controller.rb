module Admin
  class InvoicesController < Admin::BaseApplicationController
    before_filter :authenticate_staff!
    
    def index
      authorize! :read, Invoice
      
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @invoices = Invoice.all(:merchant => @merchant, :order => [:created_ts.desc]).paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @invoice = Invoice.get(params[:id]) || not_found
      authorize! :read, @invoice

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, Invoice
      
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @invoice = Invoice.new

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @merchant }
      end
    end
    
    def create
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      authorize! :create, Invoice
      
      begin
        Invoice.transaction do
          invoice = params[:invoice]
          if invoice
            charges = 0
            invoice[:type] = :one_time
            invoice[:items_attributes].each do |item|
              if !item[1][:amount].blank? && !item[1][:quantity].blank?
                charges += item[1][:amount].to_f * item[1][:quantity].to_i
              end  
            end
            invoice[:charges] = charges
            tax = charges * 0.13
            invoice[:tax] = tax
            amount = charges + tax
            invoice[:amount] = amount
          else
            invoice = Invoice.new
            invoice.errors[:base] << t("admin.invoices.min_items")
            raise DataMapper::SaveFailureError.new("", invoice)
          end
          @invoice = Invoice.create(@merchant, params[:invoice])
=begin          
          result = Braintree::Transaction.sale(
            :amount => @invoice.amount,
            :customer_id => @merchant.payment_account_id,
            :payment_method_token => "the_payment_method_token",
            :options => {
              :submit_for_settlement => true
            }
          )
=end          
          if amount >= 0.50
            result = Stripe::Charge.create(
              :amount => (amount * 100).to_i,
              :currency => "cad",
              :customer => @merchant.payment_account_id,
              :description => ""
            )
          end
          respond_to do |format|
            format.html { redirect_to(merchant_invoice_path(@merchant, @invoice), :notice => t("admin.invoices.create_success")) }
            #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
          #MerchantMailer.invoice_email(@invoice, result.success?).deliver
        end
      rescue Stripe::CardError => e
        # Since it's a decline, Stripe::CardError will be caught
        flash[:error] = "#{e.json_body[:error][:message]}"  
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::InvalidRequestError => e
        # Invalid parameters were supplied to Stripe's API
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::AuthenticationError => e
        # Authentication with Stripe's API failed
        # (maybe you changed API keys recently)
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::APIConnectionError => e
        # Network communication with Stripe failed
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::StripeError => e
        # Display a very generic error to the user, and maybe send
        # yourself an email 
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end 
      rescue DataMapper::SaveFailureError => e
        @invoice = e.resource.class.name == "InvoiceItem" ? e.resource.invoice : e.resource
        if !@invoice.id.nil?
          invoice = Invoice.new
          invoice.items = @invoice.items
          @invoice = invoice
        end
        if @invoice.errors[:base] && @invoice.errors[:base].length > 0
          flash[:error] = @invoice.errors[:base][0]
        end
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
  end
end