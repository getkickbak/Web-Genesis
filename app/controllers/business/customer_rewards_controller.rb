module Business
  class CustomerRewardsController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, CustomerReward

      @venues = current_merchant.venues
      @customer_rewards = CustomerReward.all(:merchant => current_merchant)
      @display = params[:display] || "default"
      @venue = Venue.get(params[:venue_id]) || @venues.first
      
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
      if params[:mode]
        @customer_reward.mode = params[:mode].to_sym
      end  
      @customer_reward.expiry_date = Date.today
      @venue_ids = []
      current_merchant.venues.each do |venue|
        @venue_ids << venue.id
      end
      
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def create
      authorize! :create, CustomerReward
      
      begin
        CustomerReward.transaction do
          type = CustomerRewardSubtype.get(params[:customer_reward][:type_id])
          params[:customer_reward][:venue_ids].delete("")
          if params[:customer_reward][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:customer_reward][:venue_ids]])
          else
            venues = []
          end
          CustomerReward.create(current_merchant, type, params[:customer_reward], venues)
          respond_to do |format|
            format.html { redirect_to(customer_rewards_path, :notice => t("business.customer_rewards.create_success")) }
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
      if @customer_reward.time_limited && @customer_reward.expiry_date < Date.today
        @customer_reward.expiry_date = Date.today
      end
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
          type = CustomerRewardSubtype.get(params[:customer_reward][:type_id])
          params[:customer_reward][:venue_ids].delete("")
          if params[:customer_reward][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:customer_reward][:venue_ids]])
          else
            venues = []
          end
          @customer_reward.update(type, params[:customer_reward], venues)
          respond_to do |format|
            format.html { redirect_to({:action => "index"}, {:notice => t("business.customer_rewards.update_success")}) }
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