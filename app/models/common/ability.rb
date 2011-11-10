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
  end
  
  def admin
    can :manage, :all
  end
  
  def super_admin
    admin
  end
end