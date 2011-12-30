module Business
  class VenuesController < BaseApplicationController
    before_filter :authenticate_merchant!
    set_tab :challenges
    #load_and_authorize_resource
    
    def index
      authorize! :read, Venue
      @venues = Venue.all(Venue.merchant.id => current_merchant.id)

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def show
      @venue = Venue.first(:id => params[:id]) || not_found
      authorize! :read, @venue

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def new
      authorize! :create, Venue
      @venue = Venue.new

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @merchants }
      end
    end

    def edit
      @venue = Venue.first(:id => params[:id]) || not_found
      authorize! :update, @venue
    end

    def create
      authorize! :create, Venue

      Venue.transaction do
        begin
          params[:venue][:latitude] = 43.649476
          params[:venue][:longitude] = -79.377004
          @venue = Venue.create(current_merchant, params[:venue])
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @venue.id, :notice => 'Venue was successfully crdeated.') }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @venue = e.resource
          respond_to do |format|
            format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end

    def update
      @venue = Venue.first(:id => params[:id]) || not_found
      authorize! :update, @venue

      Venue.transaction do
        begin
          @venue.update(params[:venue])
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @venue.id, :notice => 'Venue was successfully updated.') }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @merchant = e.resource
          respond_to do |format|
            format.html { render :action => "edit" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end
  end
end