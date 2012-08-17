object @customer
attributes :id, :points, :prize_points, :visits, :next_badge_visits, :eligible_for_reward, :eligible_for_prize
node( :badge_id ) { |m| m.badge.nil? ? 0 : m.badge.id }
child( { :last_check_in => :last_check_in }, :if => lambda { |m| m.last_check_in }) do |m|
	extends 'api/v1/check_ins/base'
end
child( :merchant, :if => lambda { |m| m.merchant }) do |m|
	extends 'api/v1/merchants/base'
end