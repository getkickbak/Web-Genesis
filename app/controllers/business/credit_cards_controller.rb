module Business
  class CreditCardsController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    #load_and_authorize_resource
    
    def index
      authorize! :read, CreditCard
      
      @credit_card = CreditCardForm.new
      @credit_cards = []
      if current_merchant.credit_cards.length > 0 && !current_merchant.payment_account_id.empty?
        @credit_cards = get_credit_cards
      end

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @users }
      end
    end
    
    def create
      authorize! :create, CreditCard
      
      # Temporary to hard code CA for now
      params[:credit_card_form][:country] = "CA"
      @credit_card = CreditCardForm.new(params[:credit_card_form])
      if not @credit_card.valid?
        @credit_cards = []
        @credit_cards = get_credit_cards if (current_merchant.credit_cards.length > 0 && !current_merchant.payment_account_id.empty?)
        respond_to do |format|
          format.html { render :action => "index" }
        end
        return
      end
      
      begin
        CreditCard.transaction do
          if current_merchant.payment_account_id.empty?
            result = Braintree::Customer.create(
              :first_name => current_merchant.name,
              :credit_card => {
                :number => @credit_card.number,
                :expiration_date => @credit_card.expiry_date.strftime('%m/%Y'),
                :cardholder_name => @credit_card.name,
                :cvv => @credit_card.security_code,
                :billing_address => {
                  :street_address => @credit_card.address,
                  :locality => @credit_card.city,
                  :region => Carmen::Country.coded(@credit_card.country).subregions.coded(@credit_card.state),
                  :postal_code => @credit_card.zipcode,
                  :country_code_alpha2 => @credit_card.country
                },
                :options => {
                  :verify_card => true
                }
              }
            )
          else
            result = Braintree::CreditCard.create(
              :customer_id => current_merchant.payment_account_id,
              :number => @credit_card.number,
              :expiration_date => @credit_card.expiry_date.strftime('%m/%Y'),
              :cardholder_name => @credit_card.name,
              :cvv => @credit_card.security_code,
              :billing_address => {
                :street_address => @credit_card.address,
                :locality => @credit_card.city,
                :region => Carmen::Country.coded(@credit_card.country).subregions.coded(@credit_card.state).name,
                :postal_code => @credit_card.zipcode,
                :country_code_alpha2 => @credit_card.country
              },
              :options => {
                :verify_card => true
              }
            )   
          end
          if result.success?
            if current_merchant.payment_account_id.empty?
              credit_card = CreditCard.create(:card_token => result.customer.credit_cards[0].token)
            else
              credit_card = CreditCard.create(:card_token => result.credit_card.token)
            end   
            current_merchant.add_credit_card(credit_card)
            if current_merchant.payment_account_id.empty?
              current_merchant.payment_account_id = result.customer.id
              result = Braintree::Subscription.create(
                :payment_method_token => credit_card.card_token,
                :plan_id => MerchantPlan::SMALL
              )
              if !result.success?
                raise "Error subscribing to plan"
              end
            end  
            current_merchant.save
            flash[:notice] = t('business.credit_cards.create_success')
            respond_to do |format|
              format.html { redirect_to(credit_cards_path) }
            end
          else
            raise "Error adding credit card"
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @credit_cards = []
        @credit_cards = get_credit_cards if (current_merchant.credit_cards.length > 0 && !current_merchant.payment_account_id.empty?)
        respond_to do |format|
          format.html { render :action => "index" }
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        @credit_cards = []
        @credit_cards = get_credit_cards if (current_merchant.credit_cards.length > 0 && !current_merchant.payment_account_id.empty?)
        flash[:error] = t('business.credit_cards.create_failure')
        respond_to do |format|
          format.html { render :action => "index" }
        end  
      end
    end

    def update
      credit_card = current_merchant.credit_cards.get(params[:id]) || not_found
      authorize! :update, credit_card
           
      @credit_card = CreditCardForm.new
      # Temporary to hard code CA for now    
      params[:credit_card_form][:country] = "CA"    
      params[:credit_card_form][:id] = credit_card.id
      params[:credit_card_form][:number] = "dummy"
      credit_card_form = CreditCardForm.new(params[:credit_card_form])
           
      begin     
        CreditCard.transaction do
          if not credit_card_form.valid?
            @credit_cards = get_credit_cards(credit_card_form)
            respond_to do |format|
              format.html { render :action => "index" }
            end
            return
          end
          result = Braintree::CreditCard.update(
            credit_card.card_token,
            :cardholder_name => credit_card_form.name,
            :expiration_date => credit_card_form.expiry_date.strftime('%m/%Y'),
            :cvv => credit_card_form.security_code,
            :options => {
              :verify_card => true
            },
            :billing_address => {
              :street_address => credit_card_form.address,
              :locality => credit_card_form.city,
              :region => Carmen::Country.coded(credit_card_form.country).subregions.coded(credit_card_form.state).name,
              :postal_code => credit_card_form.zipcode,
              :country_code_alpha2 => credit_card_form.country,
              :options => {
                :update_existing => true
              }
            }
          )
          if result.success?
            flash[:notice] = t('business.credit_cards.update_success')
            respond_to do |format|
              format.html { redirect_to(credit_cards_path) }
            end
          else
            raise "Error updating credit card"
          end
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        @credit_cards = get_credit_cards(credit_card_form)
        flash[:error] = t('business.credit_cards.update_failure')
        respond_to do |format|
          format.html { render :action => "index" }
        end
      end    
    end
    
    def destroy
      @credit_card =  current_merchant.credit_cards.get(params[:id]) || not_found
      authorize! :destroy, @credit_card
   
      if current_merchant.credit_cards.length == 1
        flash[:error] = t('business.credit_cards.destroy_min_failure')
        respond_to do |format|
          format.html { redirect_to(credit_cards_url) }
          #format.xml  { head :ok }
        end
        return  
      end
      
      begin
        CreditCard.transaction do
          current_merchant.remove_credit_card(@credit_card)
          Braintree::CreditCard.delete(@credit_card.card_token)
          respond_to do |format|
            format.html { redirect_to(credit_cards_url) }
            #format.xml  { head :ok }
          end
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        flash[:error] = t('business.credit_cards.destroy_failure')
        respond_to do |format|
          format.html { redirect_to(credit_cards_url) }
          #format.xml  { head :ok }
        end 
      end
    end
    
    private
    
    def get_credit_cards(validated_card = nil)
      credit_cards = []
      card_token_to_id = {}
      current_merchant.credit_cards.each do |credit_card|
        card_token_to_id[credit_card.card_token] = credit_card.id
      end
      
      customer = Braintree::Customer.find(current_merchant.payment_account_id)
      customer.credit_cards.each do |credit_card|
        if validated_card && card_token_to_id[credit_card.token] == validated_card.id
          credit_cards << validated_card
        else
          billing_address = credit_card.billing_address
          credit_cards << CreditCardForm.new(
            :id => card_token_to_id[credit_card.token],
            :type => credit_card.card_type,
            :name => credit_card.cardholder_name,
            :number => "****-#{credit_card.last_4}",
            :expiry_date => Date.strptime(credit_card.expiration_date, '%m/%Y'),
            :address => credit_card.billing_address.street_address,
            :city => credit_card.billing_address.locality,
            :state => Carmen::Country.coded(billing_address.country_code_alpha2).subregions.named(billing_address.region).code,
            :zipcode => billing_address.postal_code,
            :country => billing_address.country_code_alpha2,
          )  
        end   
      end
      return credit_cards
    end
  end
end