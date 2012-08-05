object @customer
attributes :id, :points, :prize_points, :visits, :next_badge_visits, :eligible_for_reward, :eligible_for_prize
child( :merchant, :if => lambda { |m| m.merchant }) do |m|
  extends 'api/v1/merchants/base'
end