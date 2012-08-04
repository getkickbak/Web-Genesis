object @customer_reward
attributes :id, :title, :points, :quantity_limited, :quantity, :time_limited, :expiry_date
child( { :eager_load_type => :type } ) do
	extends 'api/v1/customer_rewards/subtype'
end