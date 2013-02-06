Warden::Strategies.add(:user_check_status) do 
  def valid? 
    # code here to check whether to try and authenticate using this strategy; 
    if request.subdomain == 'www' && params[:user]
      if (params[:user].is_a? Hash) || (params[:user].is_a? ActiveSupport::HashWithIndifferentAccess)
        return params[:user][:email]
      end  
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
      if (params[:staff].is_a? Hash) || (params[:staff].is_a? ActiveSupport::HashWithIndifferentAccess)
        return params[:staff][:email]
      end
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
      if (params[:merchant].is_a? Hash) || (params[:merchant].is_a? ActiveSupport::HashWithIndifferentAccess)
        return params[:merchant][:email]
      end
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