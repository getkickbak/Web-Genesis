require 'aws/s3'
require 'guid'
require 'base64'



class ReferralsController < ApplicationController
   before_filter :authenticate_user!, :except => [:find, :find_by_deal, :find_by_user, :upload_photo]
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
      current_referral_id = params[:referral_id]
      result = Referral.find_by_deal(@deal.id, current_referral_id, start, max)

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

      deal = Deal.first(:deal_id => params[:id]) || not_found

      Referral.transaction do
         begin
            referral_count = Referral.count(:deal_id => deal.id, :confirmed => true, :creator_id => current_user.id ) || 0
            if (referral_count > 0)
            raise Exceptions::AppException.new("You have already recommended this Deal.")
            end
            photo_url = params[:photo_url] ? params[:photo_url] : deal.photo_urls.split(/\r/)[0]
            referral_info = { :photo_url => photo_url, :comment => params[:comment] }
            @referral = Referral.create(deal,current_user,referral_info)
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
            reward_count = Reward.count(:deal_id => @referral.deal.id, :user_id => current_user.id ) || 0
            if (reward_count == 0 && @referral.deal.reward_count < @referral.deal.max_reward)
            @reward = Reward.create(@referral.deal,current_user,@referral.id)
            @reward.print
            @referral.deal[:reward_count] += 1
            @referral.deal.save
            UserMailer.reward_email(@reward).deliver
            flash[:notice] = "Thank you for the referral!  Your reward email will arrive in your inbox shortly."
            else
            flash[:notice] = "Sorry, we are out of rewards but you can still take advantage of this special deal."
            end
            respond_to do |format|
            #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
            #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
               format.json { render :json => { :success => true, :msg => ["Facebook Posts", "Your recommendation has been posted on your facebook newsfeed.","Would you like to send this recommendation to specific friends?"] } }
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
      authorize! :manage, :all
      @referral = Referral.first(:referral_id => params[:id])
      @reward = Reward.first(:referral_id => @referral.id)

      respond_to do |format|
         format.html { render :template => "user_mailer/reward_email", :locals => { :reward => @reward } }
      #format.xml  { render :xml => @order }
      end
   end

   def reward_email_template
      authorize! :manage, :all
      @referral = Referral.first(:referral_id => params[:id])

      respond_to do |format|
         format.html { render :template => "user_mailer/reward_email_template", :locals => { :referral => @referral } }
      #format.xml  { render :xml => @order }
      end
   end

   def reward_template
      authorize! :manage, :all
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

   def upload_photo
      begin
         @deal = Deal.first(:deal_id => params[:deal_id])
         image = Base64.decode64(params[:data])

         msg = ["Photo has been Uploaded Successfully!"]
         #msg = ["Error Uploading Photo. Try Again"]

         #Write to Amazon S3 Datacenter
         filaename = @deal.deal_id+'/'+Guid.new + '.jpg'
         S3Object.store(filename, image, 'photos.justformyfriends.com', :content_type => 'image/jpeg', :access => :public_read)

         respond_to do |format|
            format.json { render :json => { :success => true, :msg => msg, :photo_url => 'http://photos.justformyfriends.com'+'/'+filename} }
         end
      rescue StandardError
         msg = ["Photo failed to Upload!"]
         respond_to do |format|
         #format.xml  { render :xml => referrals }
            format.json { render :json => { :success => false, :msg => msg, :photo_url : '' } }
         end
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