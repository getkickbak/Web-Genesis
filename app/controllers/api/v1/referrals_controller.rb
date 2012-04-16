require 'util/common'
require 'aws/s3'
require 'uuidtools'

#require 'base64'

class Api::V1::ReferralsController < ApplicationController
   skip_before_filter :verify_authenticity_token
   before_filter :authenticate_user!, :except => [:find, :find_by_deal, :find_by_user, :upload_photo]
   
   def find
      authorize! :read, current_user

      begin
         start = params[:start]
         max = paramx[:limit]

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
      max = params[:limit].to_i
      current_referral_id = params[:referral_id]
      result = Referral.find_by_deal(@deal.id, current_referral_id, start, max)

      respond_to do |format|
         format.json { render :json => { :success => true, :data => result[:items], :total => result[:total] } }
      end
   end

   def find_by_user
      @deal = Deal.first(:deal_id => params[:id]) || not_found
      authorize! :read, @deal

      friend_facebook_ids = params[:friend_facebook_ids].split(',')
      result = Referral.find_by_user(@deal.id, friend_facebook_ids)

      respond_to do |format|
         format.json { render :json => { :success => true, :data => result[:items], :total => result[:total] } }
      end
   end

   def create
      deal = Deal.first(:deal_id => params[:id]) || not_found
      authorize! :create, Referral

      if Date.today > deal.end_date
        respond_to do |format|
          #format.html { redirect_to default_deal_path(:notice => 'Referral was successfully created.') }
          #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
          format.json { render :json => { :success => false, :msg => ["Sorry...", "Deal is over!"] } }
        end
        return
      end
      
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

   def upload_photo
      begin
         @deal = Deal.first(:deal_id => params[:deal_id])
         image = params[:image].open

         msg = ["Photo has been Uploaded Successfully!"]
         #msg = ["Error Uploading Photo. Try Again"]

         #Write to Amazon S3 Datacenter
         filename = UUIDTools::UUID.timestamp_create().to_s.upcase + '.jpg'
         AWS::S3::S3Object.store(::Common.generate_photo_file_path(@deal.deal_id, filename), image, ::Common.get_photo_host_bucket, :content_type => 'image/jpeg', :access => :public_read)
         respond_to do |format|
            format.json { render :json => { :success => true, :msg => msg, :photo_url => ::Common.generate_full_photo_file_path(@deal.deal_id, filename)} }
         end
      rescue StandardError
         msg = ["Photo failed to Upload!"]
         respond_to do |format|
         #format.xml  { render :xml => referrals }
            format.json { render :json => { :success => false, :msg => msg, :photo_url => '' } }
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