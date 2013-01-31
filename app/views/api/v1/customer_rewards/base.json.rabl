object @customer_reward
attributes :id, :title, :points, :quantity_limited, :quantity, :quantity_count, :time_limited, :expiry_date
child( { :eager_load_type => :type } ) do
	extends 'api/v1/customer_rewards/subtype'
end
child( { :photo => :photo } ) do
	extends 'api/v1/common/photo_uploader'
end