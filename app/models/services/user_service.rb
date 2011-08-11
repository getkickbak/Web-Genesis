require 'singleton'

class UserService  
  include Singleton
  
  def authenticate(email, submitted_password)
    user = User.all(:email => email)
    return nil  if user.nil?
    return user if user.has_password?(submitted_password)
  end

  def authenticate_with_salt(id, cookie_salt)
    user = User.all(:id => id)
    (user && user.salt == cookie_salt) ? user : nil
  end
  
  def create_user(user)
    now = Time.now
    user[:created_ts] = now
    user[:update_ts] = now
    user.profile = UserProfile.new(
      :gender => :u,
      :birthday => now       
    )
    user.profile[:created_ts] = now
    user.profile[:update_ts] = now
    user.save
    return user
  end

  def get_user(user_id)
    User.get!(user_id)
  end

  def update_user(user, account_info)
    now = Time.now
    user.attributes = account_info
    user.update_ts = now
    user.save
  end

  def update_user_profile(user, profile_info)
    now = Time.now
    user.profile.attributes = profile_info
    user.profile.update_ts = now
    user.profile.save
  end

  def remove_user

  end

end