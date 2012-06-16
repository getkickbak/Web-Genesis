class Ability
  include CanCan::Ability
  
  def initialize(user)
    @user = user || User.new # for guest
    send(@user.role)
  end
  
  def anonymous
    #can :read, [Deal,Referral,Merchant]
    can :read, [Deal]
  end
  
  def user
    anonymous
    can :manage, User, :id => @user.id
    can :read, Coupon, :user => { :id => @user.id } 
    can :read, Order, :user => { :id => @user.id }
    can :create, Order
    can :delete, Order, :user => { :id => @user.id }, :payment_confirmed => false
    can [:create, :update], Referral
    can :manage, Customer, :user => { :id => @user.id }
    can :manage, CreditCard
    can :read, CustomerReward
    can :read, PurchaseReward
    can :read, Challenge 
    can :read, Venue
    can :read, EarnPrize
    can :update, EarnPrize, :user => { :id => @user.id }
  end
  
  def test
    user
  end
end