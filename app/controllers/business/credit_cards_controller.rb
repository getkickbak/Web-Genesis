module Business
  class CreditCardsController < BaseApplicationController
    before_filter :authenticate_merchant!
    #load_and_authorize_resource
    
    def index
      authorize! :read, CreditCard
      
      @credit_cards = []
      current_merchant.credit_cards.each do |credit_card|
        cc = CreditCardForm.new(:id => credit_card.id, :number => '34932432004832083')
        @credit_cards << cc
      end
      @credit_card = CreditCardForm.new
=begin      
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
=end
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @users }
      end
    end
    
    def create
      if current_merchants.credit_cards.to_a.size > 0
        respond_to do |format|
          format.html { render :action => "index" }
          format.json { render :json => { :success => false } }
        end
        return  
      end
      authorize! :create, CreditCard
      
      CreditCard.transaction do
        begin
          credit_card = CreditCard.create({ :card_token => "test"})
          current_merchant.add_credit_card(credit_card)
          respond_to do |format|
            format.html { redirect_to credit_cards_path(:notice => 'Credit card was successfully added.') }
            format.json { render :json => { :success => true, :msg => 'Credit card was successfully added.' } }
          end
        rescue DataMapper::SaveFailureError => e
          respond_to do |format|
            format.html { render :action => "index" }
            format.json { render :json => { :success => false } }
          end  
        end
      end
=begin      
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
            current_merchant.add_credit_card(credit_card)
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
=end      
    end

    def update
      @credit_card = current_merchant.credit_cards.first || not_found
      authorize! :update, @credit_card
      
      respond_to do |format|
        format.html { redirect_to credit_cards_path(:notice => 'Credit card was successfully updated.') }
        format.json { render :json => { :success => true, :msg => 'Credit card was successfully updated.' } }
      end
=begin      
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
=end          
    end
    
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
  end
end