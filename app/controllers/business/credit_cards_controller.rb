module Business
  class CreditCardsController < BaseApplicationController
    before_filter :authenticate_merchant!
    #load_and_authorize_resource
    def index
      authorize! :read, CreditCard
      
      result = BILLING_GATEWAY.query(current_merchant.merchant_id)
      @credit_card = CreditCardForm.new(
        :name => result.params['ordName'],
        :number => result.params['trnCardNumber'],
        :month => result.params['trnCardExpiry'],
        :year => result.params['trnCardExpiry'],
        :address => result.params['ordAddress1'],
        :city => result.params['ordCity'],
        :state => result.params['ordProvince'],
        :zip => result.params['ordPostalCode']
      )

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @users }
      end
    end

    def create
      authorize! :create, CreditCard
      
      CreditCard.transaction do
        begin
          am_credit_card = ActiveMerchant::Billing::CreditCard.new(
            :first_name => params[:card_info][:first_name],
            :last_name => params[:card_info][:last_name],
            :number => params[:card_info][:number],
            :month => params[:card_info][:month],
            :year => parms[:card_info][:year],
            :verification_value => params[:card_info][:cvv]
          )  
          result = BILLING_GATEWAY.store(
            am_credit_card,
            {
              :cardValidation => 1,
              :operationType => 'N',
              :vault_id => current_merchant.merchant_id,
              :status => 'A',
              :billing_address => {
                :address1 => params[:card_info][:address1],
                :city => params[:card_info][:city],
                :state => params[:card_info][:state],
                :zip => params[:card_info][:zip],
                :country => 'CA'
              }
            }
          )        
          
          ApplicaitonException.new unless result.success?
          
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
          if result.success?
            credit_card = CreditCard.create(current_merchant.merchant_id)
            current_merchant.add(credit_card)
            current_merchant.payment_account_id = result.params['rbAccountId']
            current_merchant.save
            respond_to do |format|
              format.html { redirect_to credit_card_path(:notice => 'Credit card was successfully added.') }
              format.json { render :json => { :success => true, :msg => 'Credit card was successfully added.' } }
            end
          else
            respond_to do |format|
              format.html { render :action => "index" }
              format.json { render :json => { :success => false, :msg => '' } }
            end
          end
        rescue DataMapper::SaveFailureError => e
          respond_to do |format|
            format.html { render :action => "index" }
            format.json { render :json => { :success => false } }
          end
        end
      end
    end

    def update
      @credit_card = current_merchant.credit_cards.get(params[:card_id]) || not_found
      authorize! :update, @credit_card
      
      CreditCard.transaction do
        begin
          am_credit_card = ActiveMerchant::Billing::CreditCard.new(
            :first_name => params[:card_info][:first_name],
            :last_name => params[:card_info][:last_name],
            :number => params[:card_info][:number],
            :month => params[:card_info][:month],
            :year => parms[:card_info][:year],
            :verification_value => params[:card_info][:cvv]
          ) 
          result = BILLING_GATEWAY.update(current_user.user_id, am_credit_card,
            {
              :cardValidation => 1,
              :status => 'A',
              :billing_address => {
                :address1 => params[:card_info][:address1],
                :city => params[:card_info][:city],
                :state => params[:card_info][:state],
                :zip => params[:card_info][:zip],
                :country => 'CA'
              }
            } 
          )
          
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
          if result.success?
            @credit_card.update()
            respond_to do |format|
              format.html { redirect_to credit_card_path(:notice => 'Credit card was successfully added.') }
              format.json { render :json => { :success => true, :msg => 'Credit card was successfully added.' } }
            end
          else
            respond_to do |format|
              format.html { render :action => "index" }
              format.json { render :json => { :success => false, :msg => '' } }
            end
          end
        rescue DataMapper::SaveFailureError => e
          respond_to do |format|
            format.html { render :action => "index" }
            format.json { render :json => { :success => false } }
          end
        end
      end
    end
end