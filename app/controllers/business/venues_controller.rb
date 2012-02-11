module Business
  class VenuesController < BaseApplicationController
    before_filter :authenticate_merchant!
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
      
      Venue.transaction do
        begin
          type = VenueType.get(params[:venue][:type_id])
          @venue = Venue.create(current_merchant, type, params[:venue])
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @venue.id, :notice => 'Venue was successfully created.') }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @venue = e.resource
          respond_to do |format|
            format.html { render :action => "new" }
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end
    end

    def update
      @venue = Venue.get( params[:id]) || not_found
      authorize! :update, @venue

      Venue.transaction do
        begin
          type = VenueType.get(params[:venue][:type_id])
          @venue.update(type, params[:venue])
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @venue.id, :notice => 'Venue was successfully updated.') }
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
    
    def update_qr_code
      @venue = Venue.get( params[:id]) || not_found
      authorize! :update, @venue

      Venue.transaction do
        begin
          @venue.update_qr_code()
          respond_to do |format|
            format.html { redirect_to(:action => "show", :id => @venue.id, :notice => 'QR Code was successfully updated.') }
          #format.xml  { head :ok }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @venue = e.resource
          respond_to do |format|
            format.html
          #format.xml  { render :xml => @merchant.errors, :status => :unprocessable_entity }
          end
        end
      end 
    end
    
    def destroy
      @venue = Venue.get(params[:id]) || not_found
      authorize! :destroy, @venue

      if @venue.challenges.length > 0 || @venue.purchase_rewards.length > 0 || @venue.customer_rewards.length > 0
        respond_to do |format|
          format.html { redirect_to(:action => "index", :notice => 'Failed to delete venue.  Please check to make sure no challenges or rewards are associated with this venue.') }
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