object false
node :success do 
	true
end
node :metaData do
	{
		:account_points => @customer.points,
		:data => @encrypted_data,
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
	}
end