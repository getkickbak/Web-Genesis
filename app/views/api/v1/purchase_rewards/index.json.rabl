object false
node :success do 
	true
end
node :data do
	@rewards.map do |r|
		partial('api/v1/purchase_rewards/show', :object => r) 
	end
end
node :total do
	@rewards.length
end