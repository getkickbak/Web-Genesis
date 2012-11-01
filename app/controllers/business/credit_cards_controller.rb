module Business
  class CreditCardsController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_is_admin
    #load_and_authorize_resource
    
    def index
      authorize! :read, CreditCard
      
      @credit_cards = []
      if current_merchant.credit_cards.length > 0
        credit_card = current_merchant.credit_cards.first
        result = BILLING_GATEWAY.query(
          current_merchant.id, 
          {
            :order_id => credit_card.card_token
          }
        )
        if result.success? || true
          @credit_cards << CreditCardForm.new(
            :id => credit_card.id,
            :name => 'Paul Chan',
            :number => '5409350952057043',
            :expiry_date => Date.today,
            :address => '1406 - 7 King St E',
            :city => 'Toronto',
            :state => 'Ontario',
            :zip => 'M5C 3C5'
          )
=begin        
          @credit_cards << CreditCardForm.new(
            :name => result.params['ordName'],
            :number => result.params['trnCardNumber'],
            :expiry_date => result.params['trnCardExpiry'],
            :address => result.params['ordAddress1'],
            :city => result.params['ordCity'],
            :state => result.params['ordProvince'],
            :zip => result.params['ordPostalCode']
          )
=end          
        end
      else
        @credit_card = CreditCardForm.new
      end

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @users }
      end
    end
    
    def create
      if current_merchant.credit_cards.length > 0
        respond_to do |format|
          format.html { render :action => "index" }
        end
        return  
      end
      authorize! :create, CreditCard
      
      @credit_cards = []
      @credit_card = CreditCardForm.new(params[:credit_card_form])
      if not @credit_card.valid?
        respond_to do |format|
          format.html { render :action => "index" }
        end
        return
      end
      
      begin
        CreditCard.transaction do
          month = @credit_card.expiry_date.month
          year = @credit_card.expiry_date.year
          names = @credit_card.name.split
          last_name = names.pop
          first_name = names.join(" ")
          am_credit_card = ActiveMerchant::Billing::CreditCard.new(
            :first_name => first_name,
            :last_name => last_name,
            :number => @credit_card.number,
            :month => month,
            :year => year,
            :verification_value => @credit_card.security_code
          )  
          result = BILLING_GATEWAY.store(
            am_credit_card,
            {
              :cardValidation => 1,
              :operationType => 'N',
              :vault_id => current_merchant.id,
              :status => 'A',
              :billing_address => {
                :address1 => @credit_card.address,
                :city => @credit_card.city,
                :state => @credit_card.state,
                :zip => @credit_card.zip,
                :country => 'CA'
              }
            }
          )        
=begin          
          ApplicationException.new unless result.success?
          
          result = BILLING_GATEWAY.recurring(
            amount,
            am_credit_card,
            {
              :billing_address => {
                :name => am_credit_card.name,
                :email => current_merchant.email,
                :phone => current_merchant.phone,
                :address1 => params[:card_info][:address1],
                :city => params[:card_info][:city],
                :state => params[:card_info][:state],
                :zip => params[:card_info][:zip],
                :country => 'CA'
              },
              :interval => { :unit => :months, :length => 1 },
              :occurences => 5,
              :start_date => ,
              :apply_tax1 => 1,
              :apply_tax2 => 1
            }
          )
=end          
          if result.success? || true
            credit_card = CreditCard.create(:card_token => 're9430324032')
            #credit_card = CreditCard.create(:card_token => result[:trnOrderNumber])
            current_merchant.add_credit_card(credit_card)
            #current_merchant.payment_account_id = result.params['rbAccountId']
            current_merchant.save
            flash[:notice] = t('business.api.credit_cards.create_success')
            respond_to do |format|
              format.html { redirect_to(credit_cards_path) }
            end
          else
            respond_to do |format|
              format.html { render :action => "index" }
            end
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          format.html { render :action => "index" }
        end
      end
    end

    def update
      @credit_card = current_merchant.credit_cards.first || not_found
      authorize! :update, @credit_card
           
      @credit_cards = []     
      credit_card = CreditCardForm.new(params[:credit_card_form])
      @credit_cards << credit_card
           
      begin     
        CreditCard.transaction do
          if not credit_card.number.nil?
            if not credit_card.valid?
              respond_to do |format|
                format.html { render :action => "index" }
              end
              return
            end
          end
          month = credit_card.expiry_date.month
          year = credit_card.expiry_date.year
          names = credit_card.name.split
          last_name = names.pop
          first_name = names.join(" ")
          credit_card_info = {
            :first_name => first_name,
            :last_name => last_name,
            :month => month,
            :year => year
          }
          if not credit_card.number.nil?
            credit_card_info[:number] = credit_card.number
          end
          if not credit_card.security_code.nil?
            credit_card_info[:verification_value] = credit_card.security_code
          end
          am_credit_card = ActiveMerchant::Billing::CreditCard.new(credit_card_info)
          result = BILLING_GATEWAY.update(current_merchant.id, am_credit_card,
            {
              :cardValidation => 1,
              :status => 'A',
              :billing_address => {
                :address1 => credit_card.address,
                :city => credit_card.city,
                :state => credit_card.state,
                :zip => credit_card.zip,
                :country => 'CA'
              }
            } 
          )
=begin          
          ApplicaitonException.new unless result.success?

          result = BILLING_GATEWAY.update_recurring(amount, am_credit_card,
           {
              :account_id => current_merchant.payment_account_id
              :billing_address => {
                :address1 => params[:card_info][:address1],
                :city => params[:card_info][:city],
                :state => params[:card_info][:state],
                :zip => params[:card_info][:zip],
                :country => 'CA'
              }
            } 
          )
=end          
          if result.success?
            @credit_card.update(:card_token => result[:trnOrderNumber])
            flash[:notice] = t('business.api.credit_cards.update_success')
            respond_to do |format|
              format.html { redirect_to(credit_card_path) }
            end
          else
            respond_to do |format|
              format.html { render :action => "index" }
            end
          end
        end
      rescue DataMapper::SaveFailureError => e
        respond_to do |format|
          format.html { render :action => "index" }
        end
      end    
    end
    
=begin    
    def destroy
      @credit_card = current_merchant.credit_cards.first || not_found
      authorize! :destroy, @credit_card
   
      CreditCard.transaction do
        begin
          current_merchant.remove_credit_card(@credit_card)
          respond_to do |format|
            format.html { redirect_to(credit_cards_url) }
            #format.xml  { head :ok }
          end
        rescue
          respond_to do |format|
            format.html { redirect_to(credit_cards_url) }
            #format.xml  { head :ok }
          end 
        end
      end
    end
=end    
  end
end