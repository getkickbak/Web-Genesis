object false
node :success do 
	true
end
node :data do
	@prizes.map do |r|
		partial('api/v1/earn_prizes/base', :object => r) 
	end	
end
node :metaData do
	{
		:points => @total_points,
		:vip_challenge => (
				{
					:points => @vip_points
				} if @vip_challenge
			)
	}.delete_if { |k,v| v.nil? }
end	