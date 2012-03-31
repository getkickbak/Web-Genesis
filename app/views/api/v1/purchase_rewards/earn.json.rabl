object false
node :success do 
	true
end
mpde :data do
	@prizes.map do |r|
		partial('api/v1/earn_prizes/base', :object => r) 
	end	
end
node :metaData do
	node :points do
		@total_points
	end
	if @vip_challenge
		node :vip_challenge do
			{
				:points => @vip_points
			}
		end
	end
end	