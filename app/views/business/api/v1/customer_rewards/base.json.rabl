object @customer_reward
attributes :title
child( { :type => :type } ) do
	extends 'business/api/v1/customer_rewards/subtype'
end