class Business::RewardsController < Business::ApplicationController
  
  def show
    @reward = Reward.get(params[:id])     
    #authorize! :read, @reward 
    
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @reward }
    end
  end
  
  def redeem
    @reward = Reward.get(params[:id])
    #authorize! :update, @reward

    begin
      @reward[:redeemed] = true
      @reward.save
      respond_to do |format|
        format.json { render :json => { :success => false } }
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