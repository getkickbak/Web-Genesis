module Business::SessionsHelper
  def sign_in(merchant)
    cookies.permanent.signed[:remember_token] = [merchant.id, merchant.salt]
    self.current_merchant = merchant
  end

  def signed_in?
    !current_merchant.nil?
  end

  def sign_out
    cookies.delete(:remember_token)
    self.current_merchant = nil
  end

  def current_merchant=(merchant)
    @current_merchant = merchant
  end

  def current_merchant
    @current_merchant ||= merchant_from_remember_token
  end

  def authenticate_merchant!
    deny_access unless signed_in?
  end

  def deny_access
    store_location
    redirect_to default_deal_path
  end

  private

  def merchant_from_remember_token
    Merchant.authenticate_with_salt(*remember_token)
  end

  def remember_token
    cookies.signed[:remember_token] || [nil, nil]
  end
  
  def store_location 
    session[:return_to] = request.fullpath
  end

  def redirect_back_or(default)
    redirect_to (session[:return_to] || default)
    session[:return_to] = nil
  end
end