module Business
  class RewardsController < ApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Reward
    end

    def show
      @reward = Reward.get(params[:id]) || not_found
      authorize! :read, @reward

      respond_to do |format|
        format.html # show.html.erb
        format.json  { render :json => { :success => true, :data => @reward.to_json } }
      end
    end

    def redeem
      @reward = Reward.get(params[:id]) || not_found
      authorize! :update, @reward

      begin
        @reward[:redeemed] = true
        @reward.save
        respond_to do |format|
          format.json { render :json => { :success => true } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @reward = e.resource
        respond_to do |format|
          format.json { render :json => { :success => false } }
        end
      end
    end
  end
end