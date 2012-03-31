object false
node :success do 
	true
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
	node :prizes do
		@data.map do |r|
			partial('api/v1/earn_prizes/base', :object => r) 
		end
	end
end	