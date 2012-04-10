object false
node :success do 
	true
end
node :data do
	partial('api/v1/venues/base', :object => @venue) 
end
node :metaData do
	{ 
		:eligible_rewards =>
			@eligible_rewards.map do |r|
		 		partial('api/v1/customers/eligible_reward', :object => r)
			end
	}		 	
end