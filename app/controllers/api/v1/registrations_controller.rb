class Api::V1::RegistrationsController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    begin
      User.transaction do
        user_info = JSON.parse(params[:user], { :symbolize_names => true })
        user_info[:role] = "user"
        user_info[:status] = :active
        start = params[:start].to_i
        max = params[:limit].to_i
        if user_info.include? :facebook_id
          if ThirdPartyAuth.first({:provider => "facebook", :uid => user_info[:facebook_id]})
            respond_to do |format|
              #format.xml  { head :ok }
              format.json { render :json => { :success => false, :message => t("api.users.facebook_account_already_exists_failure").split(/\n/) } }
            end
            return  
          end
          user_info[:provider] = "facebook"
          user_info[:uid] = user_info[:facebook_id]
          user_info[:token] = user_info[:accessToken]
        end
        @user = User.create(user_info)
        @results = Customer.find(@user.id, start, max)
        if user_info[:device] && (user_info[:device] != "null")
          device_info = JSON.parse(user_info[:device], { :symbolize_names => true })
          Common.register_user_device(@user, device_info)
        end
        if params[:device] && (params[:device] != "null")
          device_info = JSON.parse(params[:device], { :symbolize_names => true })
          Common.register_user_device(@user, device_info)
        end
        @web_signup = params[:web_signup] ? params[:web_signup].to_bool : false
        if !@web_signup
          session[:version] = params[:version]
          session[:user_agent] = Common.get_user_agent(request.env['HTTP_USER_AGENT'])    
          session[:resolution] = Common.get_thumbail_resolution(session[:user_agent], params[:device_pixel_ratio].to_f)
        end
        render :template => '/api/v1/tokens/create' 
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :metaData => { :rescode => 'signup_invalid_info' }, :message => e.resource.errors } }
      end  
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.create_failure").split(/\n/) } }
      end  
    end        
  end
end 