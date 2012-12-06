class Api::V1::UsersController < Api::V1::BaseApplicationController
  skip_before_filter :verify_authenticity_token
  skip_authorization_check
  respond_to :json
  
  def register_tag
    begin
      encrypted_data = params[:data].split('$')
      if encrypted_data.length != 2
        raise "Invalid authorization code format"
      end
      @venue = Venue.get(encrypted_data[0])
      if @venue.nil?
        raise "No such venue: #{encrypted_data[0]}"
      end
      data = encrypted_data[1]
      cipher = Gibberish::AES.new(@venue.auth_code)
      decrypted = cipher.dec(data)
      #logger.debug("decrypted text: #{decrypted}")
      decrypted_data = JSON.parse(decrypted)
      email = decrypted_data["email"]
      current_user = User.first(:email => email.downcase)
      if current_user.nil?
        raise "No such user: #{email.downcase}"
      end
      @tag = UserTag.get(:tag_id => decrypted_data["tag_id"])
      if @tag.nil?
        raise "No such tag: #{decrypted_data["tag_id"]}"
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
      #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => false, :message => t("api.users.invalid_code").split('\n') } }
      end
    return
    end

    begin
      if @tag.status == :active
        respond_to do |format|
        #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
          format.json { render :json => { :success => false, :message => t("api.users.tag_already_in_use_failure").split('\n') } }
        end
      end
      current_user.register_tag(@tag)
      UserMailer.activate_tag_email(current_user)
      respond_to do |format|
      #format.xml  { render :xml => @referral, :status => :created, :location => @referral }
        format.json { render :json => { :success => true } }
      end
    rescue DataMapper::SaveFailureError => e
      logger.error("Exception: " + e.resource.errors.inspect)
      respond_to do |format|
      #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.register_tag_failure").split('\n') } }
      end
    rescue StandardError => e
      logger.error("Exception: " + e.message)
      respond_to do |format|
      #format.xml  { render :xml => @referral.errors, :status => :unprocessable_entity }
        format.json { render :json => { :success => false, :message => t("api.users.register_tag_failure").split('\n') } }
      end
    end
  end
end