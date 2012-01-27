module Business
  class ChallengesController < BaseApplicationController
    before_filter :authenticate_merchant!
    
    def index
      authorize! :read, Challenge  
      @venues = current_merchant.venues

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :read, @challenge
      
      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, Challenge
      
      @available_challenge_types = get_available_challenge_types(params[:type])
      
      if params[:type]
        @challenge = Challenge.new(EatsChallenges.default_challenges[params[:type]])
      else
        @challenge = Challenge.new
      end  
      @data = @challenge.data
      
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def create
      authorize! :create, Challenge
      
      allowed = true
      if params[:challenge][:type] != 'custom'
        challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)
        challenges.each do |challenge|
          if params[:challenge][:type] == challenge.type
            allowed = false
            break;
          end
        end
      end
      
      if !allowed
        respond_to do |format|
          format.html { render :action => "new" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
        return
      end
      
      Challenge.transaction do
        begin
          if params[:challenge][:type] == 'checkin'
            params[:challenge][:data] = params[:challenge][:check_in_data]
          elsif params[:challenge][:type] == 'lottery'
            params[:challenge][:data] = params[:challenge][:lottery_data]
          end
          params[:challenge][:venue_ids].delete("")
          if params[:challenge][:venue_ids].length > 0
            venues = Venue.all(:conditions => ["id IN ?", params[:challenge][:venue_ids]])
          else
            venues = []
          end
          @challenge = Challenge.create(current_merchant, params[:challenge], venues)
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @challenge.id, :notice => 'Challenge was successfully created.') }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @challenge = e.resource
          @available_challenge_types = get_available_challenge_types(@challenge.type)
          @data = @challenge.data
          respond_to do |format|
            format.html { render :action => "new" }
            #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
          end
        end
      end    
    end
    
    def edit
      @challenge = Challenge.get(params[:id]) || not_found  
      authorize! :update, @challenge
      
      @available_challenge_types = get_available_challenge_types(@challenge.type)

      if params[:type]
        challenge_info = EatsChallenges.default_challenges[params[:type]]
        @challenge.update_without_save(challenge_info)
      end
      @data = @challenge.data
      @venue_ids = []
      @challenge.venues.each do |venue|
        @venue_ids << venue.id
      end
    end
    
    def update
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :update, @challenge

      allowed = true
      if params[:challenge][:type] != 'custom'
        challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)
        challenges.each do |challenge|
          if params[:challenge][:type] == challenge.type && params[:challenge][:type] != @challenge.type
            allowed = false
            break;
          end
        end
      end
      
      if !allowed
        respond_to do |format|
          format.html { render :action => "edit" }
          #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
        return
      end
      
      #Challenge.transaction do
         begin
            if params[:challenge][:type] == 'checkin'
              params[:challenge][:data] = params[:challenge][:check_in_data]
            elsif params[:challenge][:type] == 'lottery'
              params[:challenge][:data] = params[:challenge][:lottery_data]  
            end
            params[:challenge][:venue_ids].delete("")
            if params[:challenge][:venue_ids].length > 0
              venues = Venue.all(:conditions => ["id IN ?", params[:challenge][:venue_ids]])
            else
              venues = []
            end
            @challenge.update(params[:challenge], venues)
            respond_to do |format|
               format.html { redirect_to(:action => "show", :id => @challenge.id, :notice => 'Challenge was successfully updated.') }
               format.xml  { head :ok }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @challenge = e.resource
            @available_challenge_types = get_available_challenge_types(@challenge.type)
            @data = @challenge.data
            respond_to do |format|
               format.html { render :action => "edit" }
            #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
            end
         end
      #end
    end
    
    def destroy
      @challenge = Challenge.get(params[:id]) || not_found
      authorize! :destroy, @challenge

      @challenge.destroy

      respond_to do |format|
         format.html { redirect_to(challenges_url) }
      #format.xml  { head :ok }
      end
    end
    
    private
    
    def get_available_challenge_types(current_type)
      in_use_types = {}
      challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)
      challenges.each do |challenge|
        in_use_types[challenge.type] = challenge.type
      end
      challenge_types = []
      EatsChallenges.default_challenge_types.each do |challenge_type|
        if !(in_use_types.include? challenge_type[1]) || challenge_type[1] == 'custom' || challenge_type[1] == 'menu' || challenge_type[1] == current_type
          challenge_types << challenge_type
        end
      end
      return challenge_types
    end
  end
end