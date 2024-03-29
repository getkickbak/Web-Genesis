module Admin
  class AccountController < Admin::BaseApplicationController
    before_filter :authenticate_staff!
    #load_and_authorize_resource
    
    def edit 
      @staff = current_staff
      authorize! :update, @staff
    end

    def update
      @staff = current_staff
      authorize! :update, @staff

      begin
        Staff.transaction do
          params[:staff][:role] = @staff.role
          params[:staff][:status] = @staff.status
          @staff.update_all(params[:staff])
          respond_to do |format|
            format.html { redirect_to({:action => "edit"}, {:notice => t("admin.account.update_success")}) }
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
    
    def password
      @staff = current_staff
      authorize! :update, @staff
    end
    
    def update_password
      @staff = current_staff
      authorize! :update, @staff

      begin
        Staff.transaction do
          @staff.update_password(params[:staff])
          sign_in(current_staff, :bypass => true)
          respond_to do |format|
            format.html { redirect_to({:action => "show"}, {:notice => t("admin.account.update_password_success")}) }
          #format.xml  { head :ok }
          #format.json { render :json => { :success => true, :data => @staff, :total => 1 } }
          end
        end
      rescue DataMapper::SaveFailureError => e
        logger.error("Exception: " + e.resource.errors.inspect)
        @staff = e.resource
        respond_to do |format|
          format.html { render :action => "password" }
          #format.xml  { render :xml => @staff.errors, :status => :unprocessable_entity }
          #format.json { render :json => { :success => false } }
        end
      end
    end
  end
end