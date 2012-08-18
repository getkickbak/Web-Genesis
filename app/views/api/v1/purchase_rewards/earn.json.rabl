object false
node :success do 
	true
end
node :metaData do
	{
		:merchant_id => @venue.merchant.id,
		:customer_id => @customer.id,
		:venue => (partial('api/v1/venues/base', :object => @venue) if (@venue_id == 0 || @venue_id.nil?)),
		:prize_jackpots => @prize_jackpots,
		:badges => (
			@badges.map do |r|
				partial('api/v1/customers/badge', :object => r)
			end
		),
		:account_info => @account_info,
		:reward_info => @reward_info,
		:rewards => (
			@rewards.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end if defined? @rewards
		),
		:prizes => (
			@prizes.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end if defined? @prizes
		)
	}.delete_if { |k,v| v.nil? }
end	