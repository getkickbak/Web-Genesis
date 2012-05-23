object false
node :success do 
	true
end
if @prize
	node :data do
		partial('api/v1/earn_prizes/base', :object => @prize) 
	end
end
node :metaData do
	{
		:account_points => @customer.points,
		:account_visits => @customer.visits,
		:points => @points,
		:vip_challenge => (
				{
					:points => @vip_points
				} if @vip_challenge
			),
		:rewards => (
			@rewards.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end
		),
		:eligible_rewards => (
			@eligible_rewards.map do |r|
		 		partial('api/v1/customers/eligible_reward', :object => r)
			end
		)	
	}.delete_if { |k,v| v.nil? }
end	