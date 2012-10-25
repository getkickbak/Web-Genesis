class CanAccessResque
  def self.matches?(request)
    #return false if !request.env['warden'].authenticate?
    current_staff = request.env['warden'].user(:scope => :staff)
    return false if current_staff.blank?
    StaffAbility.new(current_staff).can? :manage, Resque
  end
end