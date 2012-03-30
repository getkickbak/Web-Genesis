object @purchase_reward
attributes :id,:title,:points
child :type do
	extends 'api/v1/purchase_rewards/type'
end