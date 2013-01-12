class Ability
  include CanCan::Ability
  
  def initialize(user)
    @user = user || User.new # for guest
    send(@user.role)
  end
  
  def anonymous
  end
  
  def user
    anonymous
    can :manage, User, :id => @user.id
    can :manage, Customer, :user => { :id => @user.id }
    can :manage, CreditCard
    can :read, CustomerReward
    can :read, Challenge 
    can :read, Venue
  end
  
  def test
    user
  end
  
  def admin
    user
  end
end