class MerchantAbility
  include CanCan::Ability
  
  def initialize(merchant)
    @merchant = merchant || Merchant.new
    can :manage, Merchant, :id => @merchant.id
    can [:read, :update], [Coupon], :order => { :deal => { :merchant => {:id => @merchant.id } } }
    can :manage, CreditCard
    can :manage, Challenge, :merchant => { :id => @merchant.id }
    can :manage, Venue, :merchant => { :id => @merchant.id }
    can :manage, CustomerReward, :merchant => { :id => @merchant.id }
    can :manage, PurchaseReward, :merchant => { :id => @merchant.id }
  end

end