module Admin
  class StaffsController < BaseApplicationController
    before_filter :authenticate_staff!
    #load_and_authorize_resource
  
    def index
      authorize! :read, Staff

      @staffs = Staff.all(:order => [:created_ts.desc]).paginate(:page => params[:page])

      respond_to do |format|
        format.html # index.html.erb
      #format.xml  { render :xml => @staffs }
      end
    end

    def show
      @staff = Staff.get(params[:id]) || current_staff
      authorize! :read, @staff

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @staff }
      end
    end

    def new
      authorize! :create, Staff
      @staff = Staff.new

      respond_to do |format|
        format.html # new.html.erb
      #format.xml  { render :xml => @staff }
      end
    end

    def edit
      @staff = Staff.get(params[:id]) || current_staff
      authorize! :update, @staff
    end

    def create
      authorize! :create, Staff
        
      begin
        Staff.transaction do
          @staff = Staff.create(params[:staff])
          respond_to do |format|
            format.html { redirect_to(staff_path(@staff), :notice => t("admin.staffs.create_success")) }
          #format.xml  { render :xml => @staff, :status => :created, :location => @staff }
          #format.json { render :json => { :success => true, :data => @staff, :total => 1 } }
          end
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

    def update
      @staff = Staff.get(params[:id]) || current_staff
      authorize! :update, @staff

      begin
        Staff.transaction do
          params[:staff][:role] = @staff.role
          params[:staff][:status] = @staff.status
          @staff.update_all(params[:staff])
          sign_in(current_staff, :bypass => true)
          respond_to do |format|
            format.html { redirect_to(staff_path(@staff), :notice => t("admin.staffs.update_success")) }
          #format.xml  { head :ok }
          #format.json { render :json => { :success => true, :data => @staff, :total => 1 } }
          end
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

    def destroy
      @staff = Staff.get(params[:id]) || not_found
      authorize! :destroy, @staff

      @staff.destroy

      respond_to do |format|
        format.html { redirect_to(staffs_url) }
      #format.xml  { head :ok }
      end
    end
  end
end