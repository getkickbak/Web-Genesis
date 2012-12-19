class Api::V1::DevicesController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def get_encryption_key
    @device = Device.first(:device_id => params[:device_id], :status => :active)
    if @device
      render :template => '/api/v1/devices/get_encryption_key'
    else
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.devices.get_encryption_key_failure").split('\n') } }
      end
    end
  end
end