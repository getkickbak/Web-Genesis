class CheckInsController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    @merchant = Merchant.first(params[:merchant_id]) || not_found
    @customer = Customer.first(Customer.merchant.id => @merchant.id, Customer.user.id => current_user.id)
    new_customer = false
    if @customer.nil?
      @customer = Customer.create(merchant,current_user)
      new_customer = true
    end
    authorize! :update, @customer
    
    CheckIn.transaction do
      begin
        now = Time.now
        CheckIn.create(@merchant,current_user)
        challenges = Challenge.all(:merchant_id => @merchant.id)
        challenges.each do |challenge|
          if challenge.type == "referral" && new_customer
            referral_challenge = ReferralChallenge.first(:merchant_id => @merchant.id, :ref_email => current_user.email)
            if referral_challenge
              referral_customer = Customer.first(:merchant_id => @merchant.id, :user_id => referral_challenge.user.id)
              referral_customer.points += challenge.points
              referral_customer.save
            end
          end
          if is_qualified_challenge?(challenge)
            record = EarnRewardRecord.new(
              :challenge_id => challenge.id,
              :points => challenge.points,
              :time => now
            )
            record.merchant = @merchant
            record.user = current_user
            record.save
            @customer.points += challenge.points
          end  
        end
        @customer.last_check_in = now
        @customer.save
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => true, :msg => ["msg"] } }
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
  
  private
  
  def is_qualified_challenge?(challenge)
    if challenge.type == "checkin"
      return checkin_challenge_met?(challenge)
    elsif challenge.type == "birthday"
      return birthday_challenge_met?(challenge)  
    end 
    return false
  end
  
  def checkin_challenge_met?(challenge)
    if RAILS_ENV == 'production'
      sql = "SELECT COUNT(*) FROM check_ins WHERE merchant_id = ? AND user_id = ? 
              AND MONTH(time) = MONTH(?)"
    else
      sql = "SELECT COUNT(*) FROM check_ins WHERE merchant_id = ? AND user_id = ? 
              AND strftime('%m',time) = strftime('%m',?)"        
    end
    count = DataMapper.repository(:default).adapter.select(
      sql, challenge.merchant.id, current_user.id, now
    )     
    challenge.data.visits_per_month == count + 1 ? true : false     
  end
  
  def birthday_challenge_met?(challenge)
    return current_user.profile.birthday == Date.today
  end
end