module Business
  class PurchaseRewardsController < BaseApplicationController
    before_filter :authenticate_merchant!
    set_tab :purchase_rewards
    
    def index
      authorize! :read, PurchaseReward
      @purchase_rewards = PurchaseReward.all(Reward.merchant.id => current_merchant.id)

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @purchase_reward = PurchaseReward.first(:id => params[:id]) || not_found
      authorize! :read, @purchase_reward

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, PurchaseReward

      @purchase_reward = PurchaseReward.new
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def create
      authorize! :create, PurchaseReward
      
      PurchaseReward.transaction do
        begin
          PurchaseReward.create(current_merchant, params[:purchase_reward])
          respond_to do |format|
            format.html { redirect_to purchase_rewards_path(:notice => 'Reward was successfully created.') }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @purchase_reward = e.resource
          respond_to do |format|
            format.html { render :action => "new" }
            #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
          end
        end
      end    
    end
    
    def edit
      @purchase_reward = PurchaseReward.first(:id => params[:id]) || not_found
      authorize! :update, @purchase_reward
    end
    
    def update
      @purchase_reward = PurchaseReward.first(:id => params[:id]) || not_found
      authorize! :update, @purchase_reward

      PurchaseReward.transaction do
         begin
            @purchase_reward.update(params[:purchase_reward])
            respond_to do |format|
               format.html { redirect_to purchase_rewards_path(:notice => 'Reward was successfully updated.') }
               format.xml  { head :ok }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @purchase_reward = e.resource
            respond_to do |format|
               format.html { render :action => "edit" }
            #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
            end
         end
      end
    end
    
    def destroy
      @purchase_reward = PurchaseReward.first(:id => params[:id]) || not_found
      authorize! :destroy, @purchase_reward

      @purchase_reward.destroy

      respond_to do |format|
         format.html { redirect_to(purchase_rewards_url) }
      #format.xml  { head :ok }
      end
    end
  end
end