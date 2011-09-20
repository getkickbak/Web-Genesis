class MerchantAbility
  include CanCan::Ability
  
  def initialize(merchant)
    @merchant = merchant || Merchant.new
    can [:read, :update], [Coupon], :order => { :deal => { :merchant => {:id => @merchant.id } } }
    can [:read, :update], [Reward], :deal => { :merchant => { :id => @merchant.id } }
  end

end