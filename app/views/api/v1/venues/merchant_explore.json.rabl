object false
node :success do 
	true
end
node :data do
	partial('api/v1/venues/base', :object => @venue) 
end
node :metaData do
	{ 
		:prize_jackpots => @prize_jackpots,
		:rewards => (
			@rewards.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end
		),
		:prizes => (
			@prizes.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end
		),
		:features_config => partial('api/v1/common/features_config', :object => @features_config)
	}.delete_if { |k,v| v.nil? }		 	
end