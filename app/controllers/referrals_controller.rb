class ReferralsController < ApplicationController
   before_filter :authenticate_user!, :only => [:create, :confirmed, :resend_reward]
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
            format.json { render :json => { :success => false } }
         end
      end
   end

   def find_by_deal
      @deal = Deal.first(:deal_id => params[:id]) || not_found
      authorize! :read, @deal

      start = params[:start].to_i
      max = params[:max].to_i
      result = Referral.find_by_deal(@deal.id, start, max)

      respond_to do |format|
         format.json { render :json => { :success => true, :data => result[:items].to_json(:only => [:photo_url, :comment, :created_ts], :methods => [:creator]), :total => result[:total] } }
      end
   end

   def find_by_user
      @deal = Deal.first(:deal_id => params[:id]) || not_found
      authorize! :read, @deal

      friend_facebook_ids = params[:friend_facebook_ids].split(',')
      result = Referral.find_by_user(@deal.id, friend_facebook_ids)

      respond_to do |format|
         format.json { render :json => { :success => true, :data => result[:items].to_json(:only => [:referral_id, :creator_facebook_id]), :total => result[:total] } }
      end
   end

   def create
      authorize! :create, Referral

      Referral.transaction do
         begin
            deal = Deal.first(:deal_id => params[:id]) || not_found
            referral_count = Referral.count(:deal_id => deal.id, :confirmed => true, :creator_id => current_user.id )
            if (referral_count > 0)
              raise Exceptions::AppException.new("You have already recommended this Deal.")
            end
            photo_url = params[:photo_url] ? params[:photo_url] : deal.photo_urls.split(/\r/)[0]
            referral_info = { :photo_url => photo_url, :comment => params[:comment] }
            #logger.debug("Before Referral Create");
            @referral = Referral.create(deal,current_user,referral_info)
            #logger.debug("After Referral Create");
            respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
               format.json { render :json => { :success => true, :data => { :referral_id => @referral.referral_id } } }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @referral = e.resource
            respond_to do |format|
            #format.html { render :action => "new" }
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
               format.json { render :json => { :success => false, :msg => ["Something went wrong", "Trouble creating a referral.  Please try again."] } }
            end
         end
      end
   end

   def confirm
      @referral = Referral.first(:referral_id => params[:id]) || not_found
      authorize! :update, @referral

      Referral.transaction do
         begin
            @referral[:confirmed] = true
            @referral.save
            reward_count = Reward.count(:deal_id => @referral.deal.id, :user_id => current_user.id )
            if (reward_count == 0)
            url = root_url
            @reward = Reward.create(@referral.deal,current_user,@referral.id,url)
            @reward.print
            #logger.debug("Before Referral Mail Create");
            UserMailer.reward_email(@reward).deliver
            #logger.debug("After Referral Mail Create");
            end
            respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
               format.json { render :json => { :success => true } }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @referral = e.resource
            respond_to do |format|
            #format.html { render :action => "new" }
            #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
               format.json { render :json => { :success => false, :msg => ["Something went wrong", "Trouble updating a referral.  Please try again."] } }
            end
         end
      end
   end

   def resend_reward
      begin
         reward = Reward.first(:user_id => current_user.id)
         msg = []
         if reward
            UserMailer.reward_email(reward).deliver
            msg = ["Your Reward has been Sent!", "An email will arrive in your inbox shortly."]
         else
            msg = ["You have no Reward!", "But, You can Refer Friends to get one :)"]
         end
         respond_to do |format|
            format.json { render :json => { :success => true, :msg => msg } }
         end
      rescue StandardError => e
         logger.error(e)
         respond_to do |format|
            format.json { render :json => { :success => false, :msg => ["Something went wrong", "Your Reward failed to Send!  Please try again."] } }
         end
      end
   end

   def reward_email
      @referral = Referral.first(:referral_id => params[:id])
      @reward = Reward.first(:referral_id => @referral.id)

      respond_to do |format|
         format.html { render :template => "user_mailer/reward_email", :locals => { :reward => @reward } }
      #format.xml  { render :xml => @order }
      end
   end

   def reward_email_template
      @referral = Referral.first(:referral_id => params[:id])

      respond_to do |format|
         format.html { render :template => "user_mailer/reward_email_template", :locals => { :referral => @referral } }
      #format.xml  { render :xml => @order }
      end
   end

   def reward_template
      @referral = Referral.first(:referral_id => params[:id])
      @reward = Reward.first(:referral_id => @referral.id)

      @reward_code = @reward.reward_code
      @qr_code = @reward.qr_code
      @deal = @reward.deal

      respond_to do |format|
         format.html { render :template => "user_mailer/reward_template" }
      #format.xml  { render :xml => @order }
      end
   end

   def destroy
      @referral = Referral.get(params[:id]) || not_found
      authorize! :destroy, @referral

      @referral.destroy

      respond_to do |format|
         format.html { redirect_to(referrals_url) }
      #format.xml  { head :ok }
      end
   end
end