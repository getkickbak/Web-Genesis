module Business
  class ChallengesController < BaseApplicationController
    before_filter :authenticate_merchant!
    set_tab :challenges
    
    def index
      authorize! :read, Challenge  
      @challenges = Challenge.all(Challenge.merchant.id => current_merchant.id)

      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def show
      @challenge = Challenge.first(:id => params[:id]) || not_found
      authorize! :read, @challenge

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end
    
    def new
      authorize! :create, Challenge
      @challenge = Challenge.new(EatsChallenges.default_challenges["checkin"])
      
      @default_challenge_types = EatsChallenges.default_challenge_types
      @default_challenges = EatsChallenges.default_challenges
      
      respond_to do |format|
        format.html # index.html.erb
        #format.xml  { render :xml => @merchants }
      end
    end
    
    def create
      authorize! :create, Challenge
      
      #Challenge.transaction do
        begin
          @challenge = Challenge.create(current_merchant, params[:challenge])
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @challenge.id, :notice => 'Challenge was successfully crdeated.') }
            #format.xml  { render :xml => @deal, :status => :created, :location => @deal }
            #format.json { render :json => { :success => true, :data => @deal, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @challenge = e.resource
          respond_to do |format|
            format.html { render :action => "new" }
            #format.xml  { render :xml => @order.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
          end
        end
      #end    
    end
    
    def edit
      @challenge = Challenge.first(:challenge_id => params[:id]) || not_found
      authorize! :update, @challenge
    end
    
    def update
      @challenge = Challenge.first(:challenge_id => params[:id]) || not_found
      authorize! :update, @challenge

      Challenge.transaction do
         begin
            @challenge.update(params[:challenge])
            respond_to do |format|
               format.html { redirect_to(:action => "show", :id => @challenge.id, :notice => 'Challenge was successfully updated.') }
               format.xml  { head :ok }
            end
         rescue DataMapper::SaveFailureError => e
            logger.error("Exception: " + e.resource.errors.inspect)
            @challenge = e.resource
            respond_to do |format|
               format.html { render :action => "edit" }
            #format.xml  { render :xml => @deal.errors, :status => :unprocessable_entity }
            #format.json { render :json => { :success => false } }
            end
         end
      end
    end
    
    def destroy
      @challenge = Challenge.first(:challenge_id => params[:id]) || not_found
      authorize! :destroy, @challenge

      @challenge.destroy

      respond_to do |format|
         format.html { redirect_to(challenges_url) }
      #format.xml  { head :ok }
      end
    end
  end
end