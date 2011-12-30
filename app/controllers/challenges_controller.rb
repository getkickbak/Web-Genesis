class ChallengesController < ApplicationController
  before_filter :authenticate_user!
  
  def find
    authorize! :read, Challenge
    @challenges = Challenge.all(:merchant_id => params[:merchant_id])
    respond_to do |format|
      #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => @challenges.to_json(:only => [:id, :title, :description, :points]) } }
    end
  end

  def start
    @merchant = Merchant.first(params[:merchant_id]) || not_found
    @challenge = Challenge.first(:id => params[:challenge_id], :merchant_id => @merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        if is_startable_challenge?(@challenge)
          start_challenge(@merchant, current_user, params[:email])
          success = true
          msg  = [""]
        else
          success = false
          msg = [""]  
        end
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => success, :msg => msg } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :msg => ["Something went wrong", "Trouble starting the challenge.  Please try again."] } }
        end
      end
    end  
  end
  
  def complete
    @merchant = Merchant.first(params[:merchant_id]) || not_found
    @challenge = Challenge.first(:id => params[:challenge_id], :merchant_id => @merchant.id) || not_found
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id) || not_found
    authorize! :update, @customer
    
    Customer.transaction do
      begin
        if is_verification_challenge?(@challenge) && ((!@challenge.require_verif) || (@challenge.require_verif && @merchant.auth_code == params[:auth_code]))
          record = EarnRewardRecord.new(
            :challenge_id => @challenge.id,
            :points => @challenge.points,
            :time => Time.now
          )
          record.merchant = @merchant
          record.user = current_user
          record.save
          @customer.points += @challenge.points
          @customer.save
          success = true
          msg = [""]
        else
          success = false
          msg = [""]   
        end
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => success, :msg => msg } }
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        respond_to do |format|
          #format.html { render :action => "new" }
          #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :msg => ["Something went wrong", "Trouble completing the challenge.  Please try again."] } }
        end
      end
    end
  end
  
  protected
  
  def is_verification_challenge?(challenge)
    if challenge.type == "menu" || challenge.type == "custom"
      return true
    end 
    return false
  end
  
  def is_startable_challenge?(challenge)
    if challenge.type == "referral"
      return true
    end
  end
  
  def start_challenge(merchant, user, ref_email)
    if challenge.type == "referral"
      ReferralChallenge.create(merchant, user, { :ref_email => ref_email })
    end
  end
end