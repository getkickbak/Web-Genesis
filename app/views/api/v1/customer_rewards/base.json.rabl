object @customer_reward
attributes :id,:title,:points
child( { :eager_load_type => :type } ) do
	extends 'api/v1/customer_rewards/type'
end