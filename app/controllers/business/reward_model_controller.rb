module Business
  class RewardModelController < BaseApplicationController
    before_filter :authenticate_merchant!
    skip_authorization_check
    
    def index
      @reward_model = current_merchant.reward_model || RewardModel.new
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def update
      @reward_model = current_merchant.reward_model
      RewardModel.transaction do
        begin
          if @reward_model.nil?
            RewardModel.create(current_merchant, params[:reward_model])
            msg = 'Reward model was setup successfully.'
          else
            @reward_model.update(params[:reward_model])
            @purchase_rewards = PurchaseReward.all(PurchaseReward.merchant.id => current_merchant.id)
            @purchase_rewards.each do |reward|
              reward.type_id = reward.type.id
              reward.rebate_rate = @reward_model.rebate_rate
              reward.points = (reward.price * reward.rebate_rate / 100 / @reward_model.price_per_point).to_i
              if reward.points == 0
                reward.points = 1
              end
              reward.save
            end
            msg = 'Reward model was successfully updated.'
          end
          respond_to do |format|
            format.html { redirect_to reward_model_path(:notice => msg) }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @reward_model = e.resource
          respond_to do |format|
             format.html { render :action => "index" }
          #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
          end
        end  
      end
    end
  end
end