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
		:prizes_count => @prizes_count,
		:badges => (
			@badges.map do |r|
				partial('api/v1/customers/badge', :object => r)
			end if defined? @badges
		),
		:account_info => (@account_info if defined? @account_info),
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
		:newsfeed => (
			@newsfeed.map do |r|
		 		partial('api/v1/common/news', :object => r)
			end
		)
	}.delete_if { |k,v| v.nil? }		 	
end