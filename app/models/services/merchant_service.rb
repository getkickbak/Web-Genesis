require 'singleton'

class MerchantService
  include Singleton
  
  def create_merchant(merchant_info)
    now = Time.now
    merchant = Merchant.new(
      :name => merchant_info[:name],
      :address => merchant_info[:address],
      :phone => merchant_info[:phone]
    )
    merchant[:created_ts] = now
    merchant[:update_ts] = now
    merchant.save
    return merchant
  end
  
  def get_merchant(id)
    Merchant.get!(id)
  end
  
  def update_merchant(merchant, merchant_info)
    now = Time.now
    merchant.attributes = merchant_info
    merchant.update_ts = now
    merchant.save   
  end
  
  def remove_merchant
  end
  
end