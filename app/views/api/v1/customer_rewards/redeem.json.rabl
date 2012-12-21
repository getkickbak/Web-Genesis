object false
node :success do 
	true
end
node :metaData do
	{
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
		)
	}
end