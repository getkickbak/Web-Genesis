object false
node :success do 
	true
end
node :metaData do
	{
		:account_points => @customer.points,
		:data => @encrypted_data
	}
end