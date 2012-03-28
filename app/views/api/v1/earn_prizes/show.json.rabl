object @earn_prize
attributes :id, :expiry_date, :created_ts
child :merchant do
	extends 'api/v1/merchants/show'
end
child :reward do
	extends 'api/v1/customer_rewards/show'
end