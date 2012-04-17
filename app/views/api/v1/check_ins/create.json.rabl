object false
node :success do 
	true
end
node :data do
	partial('api/v1/customers/base', :object => @customer) 
end
node :metaData do
	{ 
		:venue_id => @venue.id,
		:winners_count => (@winners_count if defined? @winners_count),
		:eligible_rewards => (
			@eligible_rewards.map do |r|
		 		partial('api/v1/customers/eligible_reward', :object => r)
			end if defined? @eligible_rewards
		)
	}.delete_if { |k,v| v.nil? }		 	
end