module Admin
  class AccountController < BaseApplicationController
    before_filter :authenticate_staff!
    #load_and_authorize_resource
    
    def show
      @staff = current_staff
      authorize! :read, @staff

      respond_to do |format|
        format.html # show.html.erb
      #format.xml  { render :xml => @staff }
      end
    end

    def edit
      @staff = current_staff
      authorize! :update, @staff
    end

    def update
      @staff = current_staff
      authorize! :update, @staff

      Staff.transaction do
        begin
          params[:staff][:role] = @staff.role
          params[:staff][:status] = @staff.status
          @staff.update_all(params[:staff])
          sign_in(current_staff, :bypass => true)
          respond_to do |format|
            format.html { redirect_to(account_path, :notice => 'User was successfully updated.') }
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
  end
end