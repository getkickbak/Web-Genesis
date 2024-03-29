module Business
  class VenuesController < Business::BaseApplicationController
    before_filter :authenticate_merchant!
    before_filter :check_is_admin, :only => [:new, :create]
    #load_and_authorize_resource
    
    def index
      authorize! :read, Venue
      @venues = current_merchant.venues

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @venue = Venue.get(params[:id]) || not_found
      authorize! :read, @venue

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def new
      authorize! :create, Venue
      @venue = Venue.new
      @venue[:name] = current_merchant.name
      @venue[:description] = current_merchant.description
      @venue[:website] = current_merchant.website
      @venue[:facebook_page_id] = current_merchant.facebook_page_id
      
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def edit
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      @venue.type_id = @venue.type.id
    end

    def create
      authorize! :create, Venue

      begin
        Venue.transaction do
          type = VenueType.id_to_type[params[:venue][:type_id].to_i]
          # Temporary to hard code CA for now
          params[:venue][:country] = "CA"
          @venue = Venue.create(current_merchant, type, params[:venue])
          rewards = CustomerReward.all(:merchant => current_merchant)
          rewards.each do |reward|
            reward_venue = CustomerRewardVenue.new
            reward_venue.customer_reward = reward
            reward_venue.venue = @venue
            reward_venue.save
          end
          challenges = Challenge.all(:merchant => current_merchant)
          challenges.each do |challenge|
            challenge_venue = ChallengeVenue.new
            challenge_venue.challenge = challenge
            challenge_venue.venue = @venue
            challenge_venue.save
          end
          respond_to do |format|
            format.html { redirect_to({:action => "show", :id => @venue.id}, {:notice => t("business.venues.create_success")}) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @venue = e.resource
        @venue.type_id = params[:venue][:type_id]
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end

    def update
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      begin
        Venue.transaction do
          type = VenueType.id_to_type[params[:venue][:type_id].to_i]
          # Temporary to hard code CA for now
          params[:venue][:country] = "CA"
          @venue.update_all(type, params[:venue])
          respond_to do |format|
            format.html { redirect_to({:action => "show", :id => @venue.id}, {:notice => t("business.venues.update_success")}) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @venue = e.resource
        @venue.type_id = params[:venue][:type_id]
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end    
    end

    def update_auth_code
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      begin
        Venue.transaction do
          @venue.update_auth_code()
          @venue.update_check_in_auth_code()
          respond_to do |format|
            format.html { redirect_to({:action => "show", :id => @venue.id}, {:notice => t("business.venues.update_authcode_success")}) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:error] = t("business.venues.update_authcode_failure")
        respond_to do |format|
          format.html { redirect_to({:action => "show", :id => @venue.id}) }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end        
    end
    
    def update_check_in_auth_code
      @venue = Venue.get(params[:id]) || not_found
      authorize! :update, @venue

      begin
        Venue.transaction do
          @venue.update_check_in_auth_code()
          flash[:notice] = t("business.venues.update_checkin_authcode_success")
          respond_to do |format|
            format.html { redirect_to(marketing_url) }
          #format.xml  { head :ok }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        flash[:error] = t("business.venues.update_checkin_authcode_failure")
        respond_to do |format|
          format.html { redirect_to(marketing_url) }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
        end
      end
    end
    
    def check_in_template
      @venue = Venue.get(params[:id]) || not_found
      authorize! :read, @venue
      
      @qr_code = @venue.check_in_code.qr_code
      respond_to do |format|
        format.html
      #format.xml  { render :xml => @order }
      end
    end

    def destroy
      @venue = Venue.get(params[:id]) || not_found
      authorize! :destroy, @venue

      if @venue.challenges.length > 0 || @venue.purchase_rewards.length > 0 || @venue.customer_rewards.length > 0
        flash[:error] = t("business.venues.destroy_failure")
        respond_to do |format|
          format.html { redirect_to({:action => "index"}) }
        #format.xml  { head :ok }
        end
      else
        @venue.destroy
        respond_to do |format|
          format.html { redirect_to(venues_url) }
        #format.xml  { head :ok }
        end
      end
    end
  end
end