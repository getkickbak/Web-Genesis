module Business
  class CustomerRewardsController < BaseApplicationController
    before_filter :authenticate_merchant!
    set_tab :customer_rewards
    
    def index
      authorize! :read, CustomerReward
      @customer_rewards = CustomerReward.all(CustomerReward.merchant.id => current_merchant.id)

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @customer_reward = CustomerReward.first(:id => params[:id]) || not_found
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
      
      CustomerReward.transaction do
        begin
          CustomerReward.create(current_merchant, params[:customer_reward])
          respond_to do |format|
            format.html { redirect_to customer_rewards_path(:notice => 'Reward was successfully created.') }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @customer_reward = e.resource
          respond_to do |format|
            format.html { render :action => "new" }
            #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
          end
        end
      end    
    end
    
    def edit
      @customer_reward = CustomerReward.first(:id => params[:id]) || not_found
      authorize! :update, @customer_reward
    end
    
    def update
      @customer_reward = CustomerReward.first(:id => params[:id]) || not_found
      authorize! :update, @customer_reward

      CustomerReward.transaction do
         begin
            @customer_reward.update(params[:customer_reward])
            respond_to do |format|
               format.html { redirect_to customer_rewards_path(:notice => 'Reward was successfully updated.') }
               format.xml  { head :ok }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @customer_reward = e.resource
            respond_to do |format|
               format.html { render :action => "edit" }
            #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
            end
         end
      end
    end
    
    def destroy
      @customer_reward = CustomerReward.first(:id => params[:id]) || not_found
      authorize! :destroy, @customer_reward

      @customer_reward.destroy

      respond_to do |format|
         format.html { redirect_to(customer_rewards_url) }
      #format.xml  { head :ok }
      end
    end
  end
end