object false
node :success do 
	true
end
node :data do
	@earn_prize.reward.venues.map do |r|
		partial('api/v1/venues/base', :object => r) 
	end
end
node :total do
	@earn_prize.reward.venues.length
end