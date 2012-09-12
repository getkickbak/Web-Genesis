module Business
  class RewardModelController < BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_is_admin
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
      begin
        RewardModel.transaction do
          if @reward_model.nil?
            RewardModel.create(current_merchant, params[:reward_model])
            msg = t("business.reward_model.setup_success")
          else
            @reward_model.update(params[:reward_model])
            msg = t("business.reward_model.update_success")
          end
          rewards = CustomerReward.all(:merchant => current_merchant)
          rewards.each do |reward|
            reward.type_id = reward.type.id
            if reward.mode == :reward
              reward.points = (reward.price / @reward_model.price_per_point / @reward_model.rebate_rate * 100).to_i
            else
              reward.points = (reward.price / @reward_model.price_per_prize_point / @reward_model.prize_rebate_rate * 100 / (100 - APP_PROP["BADGE_REBATE_RATE"]) * 100).to_i
            end
            reward.save
          end
          challenges = Challenge.all(:merchant => current_merchant)
          challenges.each do |challenge|
            challenge.type_id = challenge.type.id
            challenge.points = (challenge.reward_amount / @reward_model.price_per_point / @reward_model.rebate_rate * 100).to_i
            challenge.save
          end
          respond_to do |format|
            format.html { redirect_to(reward_model_path, :notice => msg) }
          end
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