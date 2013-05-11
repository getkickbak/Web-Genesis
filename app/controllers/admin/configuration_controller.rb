module Admin
  class ConfigurationController < Admin::BaseApplicationController
    before_filter :authenticate_staff!
    #load_and_authorize_resource
    
    def index
      authorize! :manage, :all
      @configuration = SiteConfiguration.new(:sms_provider => SmsProvider.get_current)
    end

    def update
      authorize! :manage, :all

      begin
        configuration = params[:site_configuration]
        SmsProvider.set_current(configuration[:sms_provider])
        respond_to do |format|
          format.html { redirect_to({:action => "index"}, {:notice => t("admin.configuration.update_success")}) }
        #format.xml  { head :ok }
        #format.json { render :json => { :success => true, :data => @staff, :total => 1 } }
        end
      rescue StandardError => e
        logger.error("Exception: " + e.message)
        respond_to do |format|
          format.html { render :action => "index" }
        #format.xml  { render :xml => @staff.errors, :status => :unprocessable_entity }
        #format.json { render :json => { :success => false } }
        end
      end
    end
  end
end