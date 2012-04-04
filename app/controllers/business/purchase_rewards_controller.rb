module Business
  class PurchaseRewardsController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, PurchaseReward
      @venues = current_merchant.venues

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @purchase_reward = PurchaseReward.get(params[:id]) || not_found
      authorize! :read, @purchase_reward

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, PurchaseReward

      @purchase_reward = PurchaseReward.new
      @purchase_reward.rebate_rate = current_merchant.reward_model.rebate_rate
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def create
      authorize! :create, PurchaseReward
      
      PurchaseReward.transaction do
        begin
          type = PurchaseRewardType.get(params[:purchase_reward][:type_id])
          params[:purchase_reward][:venue_ids].delete("")
          if params[:purchase_reward][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:purchase_reward][:venue_ids]])
          else
            venues = []
          end
          PurchaseReward.create(current_merchant, type, params[:purchase_reward], venues)
          respond_to do |format|
            format.html { redirect_to purchase_rewards_path(:notice => t("business.purchase_rewards.create_success")) }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @purchase_reward = e.resource
          @purchase_reward.type_id = params[:purchase_reward][:type_id]
          respond_to do |format|
            format.html { render :action => "new" }
            #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
          end
        end
      end    
    end
    
    def edit
      @purchase_reward = PurchaseReward.get(params[:id]) || not_found
      authorize! :update, @purchase_reward
      
      @purchase_reward.type_id = @purchase_reward.type.id
      @venue_ids = []
      @purchase_reward.venues.each do |venue|
        @venue_ids << venue.id
      end
    end
    
    def update
      @purchase_reward = PurchaseReward.get(params[:id]) || not_found
      authorize! :update, @purchase_reward

      PurchaseReward.transaction do
         begin
            type = PurchaseRewardType.get(params[:purchase_reward][:type_id])
            params[:purchase_reward][:venue_ids].delete("")
            if params[:purchase_reward][:venue_ids].length > 0
              venues = Venue.all(:conditions => ["id IN ?", params[:purchase_reward][:venue_ids]])
            else
              venues = []
            end
            @purchase_reward.update(type, params[:purchase_reward], venues)
            respond_to do |format|
               format.html { redirect_to(:action => "show", :id => @purchase_reward.id, :notice => t("business.purchase_rewards.update_success")) }
               #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @purchase_reward = e.resource
            @purchase_reward.type_id = params[:purchase_reward][:type_id]
            respond_to do |format|
               format.html { render :action => "edit" }
            #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
            end
         end
      end
    end
    
    def destroy
      @purchase_reward = PurchaseReward.get(params[:id]) || not_found
      authorize! :destroy, @purchase_reward

      @purchase_reward.destroy

      respond_to do |format|
         format.html { redirect_to(purchase_rewards_url) }
      #format.xml  { head :ok }
      end
    end
  end
end