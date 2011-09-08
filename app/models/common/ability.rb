class Ability
  include CanCan::Ability
  
  def initialize(user)
    @user = user || User.new # for guest
    send(@user.role)
  end
  
  def anonymous
    can :read, [Deal,Referral,Merchant]
    can :create, [Order]
  end
  
  def user
    anonymous
    can :manage, User, :id => @user.id
    can :read, Order, :user_id => @user.id
    can :create, [Referral]
  end
  
  def admin
    can :manage, :all
  end
  
  def super_admin
    admin
  end
end