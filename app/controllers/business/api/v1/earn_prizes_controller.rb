class Business::Api::V1::EarnPrizesController < ApplicationController
  skip_before_filter :verify_authenticity_token  
  before_filter :authenticate_merchant!
  
  def verify
    @venue = Venue.get(params[:id]) || not_found
    authorize! :read, @venue
    
    Time.zone = @venue.time_zone
    authorized = false
    begin
      data = params[:data]
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      @decrypted_data = JSON.parse(decrypted)
      data_expiry_ts = Time.at(decrypted_data["expiry_ts"])
      if (decrypted_data["type"] == EncryptedDataType::REDEEM_PRIZE) && (data_expiry_ts >= Time.now) && Cache.get(data).nil?
        authorized = true
      end
    rescue
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("business.api.earn_prizes.invalid_code").split('\n') } }
      end  
    end
    
    if authorized
      # expires in 12 hrs
      Cache.set(data, true, 43200)
      render :template => '/business/api/v1/earn_prizes/verify'
    else
      respond_to do |format|
        #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t.("business.api.earn_prizes.expired_code").split('\n') } }
      end  
    end
  end
end