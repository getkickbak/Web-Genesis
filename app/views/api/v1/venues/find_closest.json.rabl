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
		:badges => (
			@badges.map do |r|
				partial('api/v1/customers/badge', :object => r)
			end
		),
		:account_info => @account_info,
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
		:newsfeed => {
			@newsfeed.map do |r|
		 		partial('api/v1/common/news', :object => r)
			end
		}
	}		 	
end