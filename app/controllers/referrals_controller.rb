class ReferralsController < ApplicationController
  before_filter :authenticate_user!, :only => [:create]
  #load_and_authorize_resource

  def find
    authorize! :read, current_user

    begin
      start = params[:start]
      max = paramx[:max]

      referrals = []
      if (params[:mode] == "")
        referrals = Referral.find_created_by(current_user.id, start, max)
      else
        referrals = Referral.find_received_by(current_user.id, start, max)
      end

      respond_to do |format|
        #format.xml  { render :xml => referrals }
        format.json { render :json => { :success => true, :data => referrals, :total => referrals.count } }
      end
    rescue StandardError
      respond_to do |format|
        #format.xml  { render :xml => referrals }
        format.json { render :json => { :false => true } }
      end
    end
  end
  
  def create
    authorize! :create, Referral

    Referral.transaction do
      begin
        deal = Deal.first(:deal_id => params[:id])
        photo_url = params[:photo_url] ? params[:photo_url] : deal.photo_url1
        referral_info = { :photo_url => photo_url, :comment => params[:comment] }
        @referral = Referral.create(deal,current_user,referral_info)
        reward_count = Reward.count(:deal_id => deal.id, :user_id => current_user.id )
        if (reward_count == 0)
          @reward = Reward.create(deal,current_user,@referral.id)
        end
        respond_to do |format|
          format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          #format.json { render :json => { :success => true, :data => @referral, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @referral = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end
    end
  end

  def destroy
    @referral = Referral.get(params[:id])
    authorize! :destroy, @referral

    @referral.destroy

    respond_to do |format|
      format.html { redirect_to(referrals_url) }
      #format.xml  { head :ok }
    end
  end
end