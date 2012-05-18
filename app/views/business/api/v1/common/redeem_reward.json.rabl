object @redeem_reward
attributes :title
child( { :type => :type } ) do
	extends 'business/api/v1/common/redeem_reward_type'
end