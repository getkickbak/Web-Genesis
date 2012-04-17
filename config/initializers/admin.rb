class CanAccessResque
  def self.matches?(request)
    current_staff = request.env['warden'].user(:scope => :staff)
    return false if current_staff.blank?
    StaffAbility.new(current_staff).can? :manage, Resque
  end
end