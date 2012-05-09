object false
node :success do 
	true
end
if @prize
	node :data do
		partial('api/v1/earn_prizes/base', :object => @prize) 
	end
end
node :metaData do
	{
		:account_points => @customer.points,
		:account_visits => @customer.visits,
		:points => @points,
		:vip_challenge => (
				{
					:points => @vip_points
				} if @vip_challenge
			)
	}.delete_if { |k,v| v.nil? }
end	