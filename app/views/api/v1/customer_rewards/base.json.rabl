object @customer_reward
attributes :id,:title,:points
child :type do
	extends 'api/v1/customer_rewards/type'
end