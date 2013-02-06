Warden::Strategies.add(:user_check_status) do 
  def valid? 
    # code here to check whether to try and authenticate using this strategy; 
    Rails.logger.info("Request subdomain: #{request.subdomain}")
    if request.subdomain == 'www' && params[:user]
      Rails.logger.info("Email: #{params[:user][:email]}")
      return params[:user][:email]
    end
    return false
  end 

  def authenticate! 
    resource = User.first(:email => params[:user][:email])
    if resource.nil?
      fail!(I18n.t("devise.failure.invalid"))
    else
      if resource.status == :active
        pass
      else
        if resource.status == :suspended
          message = I18n.t("devise.failure.suspended")
        else
          message = I18n.t("devise.failure.invalid")
        end  
        # if fail, call 
        fail!(message) # where message is the failure message 
      end
    end  
  end 
end 

Warden::Strategies.add(:staff_check_status) do 
  def valid? 
    # code here to check whether to try and authenticate using this strategy; 
    if request.subdomain == 'manage' && params[:staff]
      return params[:staff][:email]
    end
    return false
  end 

  def authenticate!  
    resource = Staff.first(:email => params[:staff][:email])
    if resource.nil?
      fail!(I18n.t("devise.failure.invalid"))
    else
      if resource.status == :active
        pass
      else
        if resource.status == :suspended
          message = I18n.t("devise.failure.suspended")
        else
          message = I18n.t("devise.failure.invalid")
        end  
        # if fail, call 
        fail!(message) # where message is the failure message 
      end
    end  
  end 
end 

Warden::Strategies.add(:merchant_check_status) do 
  def valid? 
    # code here to check whether to try and authenticate using this strategy; 
    if request.subdomain == 'merchant' && params[:merchant]
      return params[:merchant][:email]
    end
    return false
  end 

  def authenticate!
    resource = Merchant.first(:email => params[:merchant][:email])
    if resource.nil?
      fail!(I18n.t("devise.failure.invalid"))
    else
      if resource.status == :active
        pass
      else
        if resource.status == :suspended
          message = I18n.t("devise.failure.suspended")
        else
          message = I18n.t("devise.failure.invalid")
        end  
        # if fail, call 
        fail!(message) # where message is the failure message 
      end
    end  
  end 
end