class ReferralsController < ApplicationController
  def index
    user_id = 1
    start = 0
    max = 10
    @referrals = ReferralService.instance.get_referrals_received(user_id, start, max)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @referrals }
    end
  end

  def create
    Referral.transaction do
      begin
        deal = DealService.instance.get_deal(params[:id])
        user = UserService.instance.get_user(1)
        referral_info = { :photo_url => deal.item.photo_url }
        @referral = ReferralService.instance.create_referral(deal,user,referral_info)
        respond_to do |format|
          format.html { redirect_to root_path(:notice => 'Referral was successfully created.') }
          format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true, :data => @referral, :total => 1 } }
        end
      rescue DataMapper::SaveFailureError => e
        puts "Exception: " + e.resource.errors.inspect
        @referral = e.resource
        respond_to do |format|
          format.html { render :action => "new" }
          format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end

  def get
    begin
      start = params[:start]
      max = paramx[:max]

      referrals = []
      if (params[:mode] == "")
        referrals = ReferralService.instance.get_referrals_created_by(user_id, start, max)
      else
        referrals = ReferralService.instance.get_referrals_received(user_id, start, max)
      end

      respond_to do |format|
        format.xml  { render :xml => referrals }
        format.json { render :json => { :success => true, :data => referrals, :total => referrals.count } }
      end
    rescue StandardError
      respond_to do |format|
        format.xml  { render :xml => referrals }
        format.json { render :json => { :false => true } }
      end
    end
  end

end