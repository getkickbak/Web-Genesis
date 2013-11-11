class UserDevise::RegistrationsController < Devise::RegistrationsController
  before_filter :check_phone
  
  # GET /resource/sign_up
  def new
    @user = build_resource({})
=begin    
    user = User.first(:phone => session[:phone_number])
    if user
      session[:has_tag] = !user.tags.first.nil?
    else
      session[:has_tag] = false
    end 
=end 
    session[:has_tag] = false    
    respond_with @user
  end
  
  def create
    begin
      User.transaction do  
        params[:user][:role] = "user"
        params[:user][:status] = :active
        params[:user][:phone].gsub!(/\-/, "")
        if session["devise.facebook_data"]
          data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
          params[:user][:gender] = (data["gender"] == "male" ? :m : :f) if data["gender"]
          params[:user][:birthday] = Date.strptime(data["birthday"], '%m/%d/%Y') if data["birthday"]
        end
        resource = User.create(params[:user])
        if params[:user][:tag_id] && !params[:user][:tag_id].empty?
          user_tag = UserTag.first(:tag_id => params[:user][:tag_id])
          resource.register_tag(user_tag)
        end
        session.delete session[:phone_number]
        session.delete session[:has_tag]
        if resource.active_for_authentication?
          set_flash_message :notice, :signed_up if is_navigational_format?
          sign_in(resource_name, resource)
          respond_with resource, :location => after_sign_up_path_for(resource)
        else
          set_flash_message :notice, :inactive_signed_up, :reason => resource.inactive_message.to_s if is_navigational_format?
          expire_session_data_after_sign_in!
          respond_with resource, :location => after_inactive_sign_up_path_for(resource)
        end    
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      @user = e.resource
      if !@user.new?
        @user.persistence_state = DataMapper::Resource::PersistenceState::Transient.new(@user)
      end
      session[:phone_number] = @user.phone
      user = User.first(:phone => session[:phone_number])
      if user
        session[:has_tag] = !user.tags.first.nil?
      else
        session[:has_tag] = false
      end  
      clean_up_passwords(@user)  
      respond_with @user
    end    
  end
  
  private
  
  def check_phone
=begin
    if session[:phone_number].nil?
      respond_to do |format|
        format.html { redirect_to root_path }
      end
    end
=end
  end
end 