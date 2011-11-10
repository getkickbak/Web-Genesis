module Business
  class RewardsController < ApplicationController
    before_filter :authenticate_merchant!
    set_tab :rewards
    def index
      authorize! :read, Reward

      if params[:search]
      @reward = Reward.first(:reward_code => params[:search])
      end
    end

    def show
      @reward = Reward.get(params[:id]) || not_found
      authorize! :read, @reward

      respond_to do |format|
        format.json  { render :json => { :success => true, :data => @reward.to_json } }
      end
    end

    def redeem
      @reward = Reward.first(:reward_code => params[:id]) || not_found
      authorize! :update, @reward

      if @reward.expiry_date.to_date >= Date.today
        error_msg = "Error redeeming reward.  Please try again."
        flash[:error] = error_msg
        respond_to do |format|
          format.html { redirect_to rewards_path+"?search=#{params[:id]}" }
          format.json { render :json => { :success => false, :msg => error_msg } }
        end
      end
      
      Reward.transaction do
        begin
          @reward[:redeemed] = true
          @reward[:update_ts] = Time.now
          @reward.save
          msg = "Reward# #{@reward.reward_code} has been successfully redeemed."
          flash[:notice] = msg
          respond_to do |format|
            format.html { redirect_to rewards_path+"?search=#{params[:id]}" }
            format.json { render :json => { :success => true, :msg => msg } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          error_msg = "Error redeeming reward.  Please try again."
          flash[:error] = error_msg
          respond_to do |format|
            format.html { redirect_to rewards_path+"?search=#{params[:id]}" }
            format.json { render :json => { :success => false, :msg => error_msg } }
          end
        end
      end
    end
  end
end