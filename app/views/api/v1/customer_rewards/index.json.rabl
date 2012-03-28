object false
node :success do 
	true
end
node :data do
	@rewards.map do |r|
		partial('api/v1/customer_rewards/base', :object => r) 
	end
end
node :total do
	@rewards.length
end