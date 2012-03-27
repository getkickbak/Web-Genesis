class API::V1::RegistrationsController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def create
    User.transaction do
      begin
        params[:user][:role] = "user"
        params[:user][:status] = :active
        @user = User.create(params[:user])
        render :json => { :success => true, :data => @user.to_json(:only => [:authentication_token]) }
      rescue DataMapper::SaveFailureError => e
        render :json => { :success => false, :metaData => e.resource.errors.to_json }
      rescue
        render :json => { :success => false, :messasge => [""] }
      end
    end
  end
end 