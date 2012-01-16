class StaffAbility
  include CanCan::Ability
  
  def initialize(staff)
    @staff = staff
    send(@staff.role)
  end

  def staff
    can :manage, Staff, :id => @staff.id
  end
  
  def sales
    staff
    can :manage, Deal
    can [:read,:create,:update], Merchant
  end

  def admin
    can :manage, :all
  end

  def super_admin
    admin
  end
end