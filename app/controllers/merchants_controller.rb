class MerchantsController < ApplicationController
  skip_authorization_check
  
  def show
    @merchant = Merchant.get(params[:id]) || not_found

    if signed_in?
      @customer = Customer.first(:user => current_user, :merchant => @merchant)
      if @customer
        Common.populate_badge(@customer.badge, :iphone, :mxhdpi)
        @next_badge = Common.find_next_badge(@merchant.badges.to_a, @customer.badge)
      end
    end
    @challenges = Common.get_challenges_by_merchant(@merchant)
    @customer_rewards = Common.get_rewards_by_merchant(@merchant)

    respond_to do |format|
      format.html # index.html.erb
    #format.xml  { render :xml => @merchants }
    end
  end
end