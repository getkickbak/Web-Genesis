class UserDevise::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    origin_path = request.env["omniauth.origin"]
    if origin_path == new_user_session_url || origin_path == new_user_registration_url
      # You need to implement the method below in your model (e.g. app/models/user.rb)
      third_party_auth = ThirdPartyAuth.first(:provider => request.env["omniauth.auth"].provider, :uid => request.env["omniauth.auth"].uid)
      @user = (third_party_auth ? third_party_auth.user : nil)
      if @user
        @user.update_facebook_auth({:provider => request.env["omniauth.auth"].provider, :uid => request.env["omniauth.auth"].uid, :token => request.env["omniauth.auth"].credentials.token})
        sign_in_and_redirect @user, :event => :authentication #this will throw if @user is not activated
        set_flash_message(:notice, :success, :kind => "Facebook") if is_navigational_format?
      else
        (session["devise.facebook_data"] = request.env["omniauth.auth"])
        redirect_to new_user_registration_url
      end  
    else
      (session["devise.facebook_data"] = request.env["omniauth.auth"])
      redirect_to origin_path
    end
  end

  def passthru
    raise ActionController::RoutingError.new('Not Found')
  end
end