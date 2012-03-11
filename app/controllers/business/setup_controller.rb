module Business
  class SetupController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    
    def index
      if current_merchant.status == :active
        respond_to do |format|
          format.html { redirect_to dashboard_path }
        end
      else
        build_checklist
        respond_to do |format|
          format.html # index.html.erb
          #format.xml  { render :xml => @merchants }
        end
      end
    end
    
    def activate
      if current_merchant.status == :pending && has_venues? && set_reward_model? && has_purchase_rewards? && has_customer_rewards? && has_challenges?
        Merchant.transaction do
          begin
            current_merchant.update_without_password(:type_id => current_merchant.type.id, :status => :active)
            respond_to do |format|
              format.html { redirect_to dashboard_path }
            end
          rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            current_merchant.status = :pending
            build_checklist
            respond_to do |format|
              format.html { render :action => "index" }
            #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
            end
          end
        end   
      else
        respond_to do |format|
          format.html { render :action => "index" }
        #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
        #format.json { render :json => { :success => false } }
        end   
      end 
    end
    
    private 
    
    def build_checklist
      @checklist = {:total => 0, :count => 0, :data => {} }
      @checklist[:data][:upload_photo] = upload_photo?
      @checklist[:data][:venues] = has_venues?
      @checklist[:data][:reward_model] = set_reward_model?
      @checklist[:data][:purchase_rewards] = has_purchase_rewards?
      @checklist[:data][:customer_rewards] = has_customer_rewards?
      @checklist[:data][:challenges] = has_challenges?
      @checklist[:total] = @checklist[:data].length
      @checklist[:count] = 0
      @checklist[:data].each do |key,value|
        if value
          @checklist[:count] += 1
        end
      end
    end
    
    def upload_photo?
      current_merchant.photo_url ? true : false  
    end
    
    def has_venues?
      Venue.count(Venue.merchant.id => current_merchant.id) > 0 ? true : false
    end
    
    def set_reward_model?
      current_merchant.reward_model.nil? ? false : true  
    end
    
    def has_purchase_rewards?
      PurchaseReward.count(PurchaseReward.merchant.id => current_merchant.id) > 0 ? true : false
    end
    
    def has_customer_rewards?
      CustomerReward.count(CustomerReward.merchant.id => current_merchant.id) > 0 ? true : false
    end
    
    def has_challenges?
      Challenge.count(Challenge.merchant.id => current_merchant.id) > 0 ? true : false
    end
  end
end