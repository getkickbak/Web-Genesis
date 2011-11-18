class CanAccessResque
  def self.matches?(request)
    cookie = ActionDispatch::Cookies::CookieJar.build(request)
    remember_token = cookie.signed[:remember_token]
    return false if remember_token.nil?
    current_user = User.authenticate_with_salt(*remember_token)
    return false if current_user.nil?
    Ability.new(current_user).can? :manage, Resque
  end
end