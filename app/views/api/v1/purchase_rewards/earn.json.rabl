object false
node :success do 
	true
end
node :data do
	node :vip_challenge do
		@vip_challenge
	end
	node :vip_points do
		@vip_points
	end
end
node :metaData do
	node :prizes do
		@data.map do |r|
			partial('api/v1/earn_prizes/show', :object => r) 
		end
	end
end	