class CanAccessResque
  def self.matches?(request)
    cookie = ActionDispatch::Cookies::CookieJar.build(request)
    remember_token = cookie.signed[:remember_token]
    return false if remember_token.nil?
    current_staff = Staff.authenticate_with_salt(*remember_token)
    return false if current_staff.nil?
    StaffAbility.new(current_staff).can? :manage, Resque
  end
end