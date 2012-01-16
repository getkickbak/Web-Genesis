module Admin
  class StaffsController < BaseApplicationController
    before_filter :authenticate_staff!
    #load_and_authorize_resource
  
    def index
      authorize! :read, Staff

      start = 0
      max = 10
      @staffs = Staff.find(start, max)

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @staffs }
      end
    end

    def show
      @staff = Staff.first(:staff_id => params[:id]) || current_staff
      authorize! :read, @staff

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @staff }
      end
    end

    def new
      @staff = Staff.new
      authorize! :create, @staff

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @staff }
      end
    end

    def edit
      @staff = Staff.first(:staff_id => params[:id]) || current_staff
      authorize! :update, @staff
    end

    def create
      authorize! :create, Staff

      Staff.transaction do
        begin
          @staff = Staff.create_without_devise(params[:staff])
          respond_to do |format|
            format.html { redirect_to(admin_staff_path(@staff), :notice => 'Staff was successfully created.') }
          #format.xml  { render :xml => @staff, :status => :created, :location => @staff }
          #format.json { render :json => { :success => true, :data => @staff, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @staff = e.resource
          respond_to do |format|
            format.html { render :action => "new" }
          #format.xml  { render :xml => @staff.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
          end
        end
      end
    end

    def update
      @staff = Staff.first(:staff_id => params[:id]) || current_staff
      authorize! :update, @staff

      Staff.transaction do
        begin
          @staff.update(params[:staff])
          sign_in(current_staff, :bypass => true)
          respond_to do |format|
            format.html { redirect_to(admin_staff_path(@staff), :notice => 'Staff was successfully updated.') }
          #format.xml  { head :ok }
          #format.json { render :json => { :success => true, :data => @staff, :total => 1 } }
          end
        rescue DataMapper::SaveFailureError => e
          logger.error("Exception: " + e.resource.errors.inspect)
          @staff = e.resource
          respond_to do |format|
            format.html { render :action => "edit" }
          #format.xml  { render :xml => @staff.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
          end
        end
      end
    end

    def destroy
      @staff = Staff.get(params[:id]) || not_found
      authorize! :destroy, @staff

      @staff.destroy

      respond_to do |format|
        format.html { redirect_to(admin_staffs_url) }
      #format.xml  { head :ok }
      end
    end
  end
end