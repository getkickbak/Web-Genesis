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
            invoice[:type] = :one_time
          else
            invoice = Invoice.new
            invoice.errors[:base] << t("admin.invoices.min_items")
            raise DataMapper::SaveFailureError.new("", invoice)
          end
          @invoice = Invoice.create(@merchant, params[:invoice])
          charges = 0.00
          @invoice.items.each do |item|
            if item.price > 0.00 && item.quantity > 0
              charges += item.price * item.quantity
            elsif item.amount > 0.00
              charges += item.amount
            end
          end
          @invoice.charges = charges
          tax = charges * 0.13
          @invoice.tax = tax
          amount = charges + tax
          @invoice.amount = amount
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
          @invoice.paid = true
          @invoice.update_ts = Time.now
          @invoice.save
          Business::MerchantMailer.invoice_email(@invoice).deliver
          respond_to do |format|
            format.html { redirect_to(merchant_invoice_path(@merchant, @invoice), :notice => t("admin.invoices.create_success")) }
            #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
          end
        end
      rescue Stripe::CardError => e
        # Since it's a decline, Stripe::CardError will be caught
        if !@invoice.id.nil?
          invoice = Invoice.new
          invoice.items = @invoice.items
          @invoice = invoice
        end
        flash[:error] = "#{e.json_body[:error][:message]}"  
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::InvalidRequestError => e
        # Invalid parameters were supplied to Stripe's API
        if !@invoice.id.nil?
          invoice = Invoice.new
          invoice.items = @invoice.items
          @invoice = invoice
        end
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::AuthenticationError => e
        # Authentication with Stripe's API failed
        # (maybe you changed API keys recently)
        if !@invoice.id.nil?
          invoice = Invoice.new
          invoice.items = @invoice.items
          @invoice = invoice
        end
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::APIConnectionError => e
        # Network communication with Stripe failed
        if !@invoice.id.nil?
          invoice = Invoice.new
          invoice.items = @invoice.items
          @invoice = invoice
        end
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      rescue Stripe::StripeError => e
        # Display a very generic error to the user, and maybe send
        # yourself an email 
        if !@invoice.id.nil?
          invoice = Invoice.new
          invoice.items = @invoice.items
          @invoice = invoice
        end
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
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        flash[:error] = t("admin.invoices.create_failure")
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end  
      end
    end
  
    def pay
      @merchant = Merchant.get(params[:merchant_id]) || not_found
      @invoice = Invoice.get(params[:id]) || not_found
      authorize! :update, @invoice
      
      begin
        Invoice.transaction do
          if not @invoice.paid
            result = Stripe::Charge.create(
              :amount => (@invoice.amount * 100).to_i,
              :currency => "cad",
              :customer => @merchant.payment_account_id,
              :description => ""
            )
            @merchant.payment_subscription.paid_through_date = @invoice.end_date
            @merchant.payment_subscription.save
            @invoice.paid = true
            @invoice.update_ts = Time.now
            @invoice.save
            Business::MerchantMailer.invoice_email(@invoice).deliver
            respond_to do |format|
              format.html { redirect_to(merchant_invoice_path(@merchant, @invoice), :notice => t("admin.invoices.pay_success")) }
              #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
            end
          else
            flash[:error] = t("admin.invoices.already_paid")
            respond_to do |format|
              format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
              #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
            end  
          end
        end
      rescue Stripe::CardError => e
        # Since it's a decline, Stripe::CardError will be caught
        flash[:error] = "#{e.json_body[:error][:message]}"  
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      rescue Stripe::InvalidRequestError => e
        # Invalid parameters were supplied to Stripe's API
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      rescue Stripe::AuthenticationError => e
        # Authentication with Stripe's API failed
        # (maybe you changed API keys recently)
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      rescue Stripe::APIConnectionError => e
        # Network communication with Stripe failed
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      rescue Stripe::StripeError => e
        # Display a very generic error to the user, and maybe send
        # yourself an email 
        flash[:error] = "#{e.json_body[:error][:message]}"
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end 
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:error] = t("admin.invoices.payment_subscription_update_failure")
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        flash[:error] = t("admin.invoices.payment_subscription_update_failure")
        respond_to do |format|
          format.html { redirect_to(merchant_invoice_path(@merchant, @invoice)) }
          #format.xml  { render :xml => @merchant, :status => :created, :location => @merchant }
        end
      end
    end
  end
end