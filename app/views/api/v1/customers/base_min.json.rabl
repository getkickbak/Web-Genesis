object @customer
attributes :id, :points, :prize_points, :visits, :next_badge_visits, :eligible_for_reward, :eligible_for_prize
child( { :eager_load_merchant => :merchant } ) do
  extends 'api/v1/merchants/base'
end