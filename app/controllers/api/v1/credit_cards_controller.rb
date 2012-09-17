class Api::V1::CreditCardsController < Api::V1::BaseApplicationController
  before_filter :authenticate_user!

  def index
    authorize! :read, CreditCard
    
    result = BILLING_GATEWAY.query(current_user.id)
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
    #format.xml  { render :xml => @users }
      format.json  { render :json => { :success => true, :data => @credit_card } }
    end
  end

  def create
    authorize! :create, CreditCard
    
    begin
      CreditCard.transaction do
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
            :vault_id => current_user.id,
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
        if result.success?
          credit_card = CreditCard.create(:card_token => current_user.id)
          current_user.add(credit_card)
          respond_to do |format|
            format.json { render :json => { :success => true, :message => 'Credit card was successfully added.' } }
          end
        else  
          
        end
      end
    rescue DataMapper::SaveFailureError => e
      respond_to do |format|
        format.json { render :json => { :success => false } }
      end  
    end    
  end

  def update
    @credit_card = current_user.credit_cards.get(params[:card_id]) || not_found
    authorize! :update, @credit_card
    
    begin
      CreditCard.transaction do
        @credit_card.update()
        am_credit_card = ActiveMerchant::Billing::CreditCard.new(
          :first_name => params[:card_info][:first_name],
          :last_name => params[:card_info][:last_name],
          :number => params[:card_info][:number],
          :month => params[:card_info][:month],
          :year => parms[:card_info][:year],
          :verification_value => params[:card_info][:cvv]
        ) 
        result = BILLING_GATEWAY.update(current_user.id, am_credit_card,
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
        if result.success?
          @credit_card.update()
          respond_to do |format|
            format.json { render :json => { :success => true, :message => ['Credit card was successfully added.'] } }
          end
        else
        end  
      end
    rescue DataMapper::SaveFailureError => e
      respond_to do |format|
        format.json { render :json => { :success => false } }
      end
    end    
  end

  def destroy
    @credit_card = current_user.credit_cards.get(params[:card_id]) || not_found
    authorize! :destroy, @credit_card
   
    begin
      CreditCard.transaction do
        current_user.remove_credit_card(@credit_card)
        Braintree::CreditCard.delete(@credit_card.card_token)
        respond_to do |format|
          #format.xml  { head :ok }
        end
      end
    rescue
      respond_to do |format|
        #format.xml  { head :ok }
      end 
    end    
  end
end