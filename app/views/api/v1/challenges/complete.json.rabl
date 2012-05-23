object false
node :success do 
	true
end
node :metaData do
	{ 
		:account_points => @customer.points, 
		:points => @points,
		:rewards => (
			@rewards.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end if defined? @rewards
		),
		:eligible_rewards => (
			@eligible_rewards.map do |r|
		 		partial('api/v1/customers/eligible_reward', :object => r)
			end if defined? @eligible_rewards
		),
		:message => (@msg if defined? @msg)
	}.delete_if { |k,v| v.nil? }		 	
end