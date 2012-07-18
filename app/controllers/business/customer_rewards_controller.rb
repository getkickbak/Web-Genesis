module Business
  class CustomerRewardsController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, CustomerReward
      
      @venues = current_merchant.venues
      @cusotmer_rewards = CustomerReward.all(CustomerReward.merchant.id => current_merchant.id)
      @display = params[:display]
      @venue_id = params[:venue_id]
      
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @customer_reward = CustomerReward.get(params[:id]) || not_found
      authorize! :read, @customer_reward

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, CustomerReward

      @customer_reward = CustomerReward.new
      
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def create
      authorize! :create, CustomerReward
      
      begin
        CustomerReward.transaction do
          type = CustomerRewardType.get(params[:customer_reward][:type_id])
          params[:customer_reward][:venue_ids].delete("")
          if params[:customer_reward][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:customer_reward][:venue_ids]])
          else
            venues = []
          end
          CustomerReward.create(current_merchant, type, params[:customer_reward], venues)
          respond_to do |format|
            format.html { redirect_to customer_rewards_path(:notice => t("business.customer_rewards.create_success")) }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @customer_reward = e.resource
        @customer_reward.type_id = params[:customer_reward][:type_id]
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end        
    end
    
    def edit
      @customer_reward = CustomerReward.get(params[:id]) || not_found
      authorize! :update, @customer_reward
      
      @customer_reward.type_id = @customer_reward.type.id
      @venue_ids = []
      @customer_reward.venues.each do |venue|
        @venue_ids << venue.id
      end
    end
    
    def update
      @customer_reward = CustomerReward.get(params[:id]) || not_found
      authorize! :update, @customer_reward

      begin
        CustomerReward.transaction do
          type = CustomerRewardType.get(params[:customer_reward][:type_id])
          params[:customer_reward][:venue_ids].delete("")
          if params[:customer_reward][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:customer_reward][:venue_ids]])
          else
            venues = []
          end
          @customer_reward.update(type, params[:customer_reward], venues)
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @customer_reward.id, :notice => t("business.customer_rewards.update_success")) }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @customer_reward = e.resource
        @customer_reward.type_id = params[:customer_reward][:type_id]
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end    
    end
    
    def destroy
      @customer_reward = CustomerReward.get(params[:id]) || not_found
      authorize! :destroy, @customer_reward

      @customer_reward.destroy

      respond_to do |format|
         format.html { redirect_to(customer_rewards_url) }
      #format.xml  { head :ok }
      end
    end
  end
end