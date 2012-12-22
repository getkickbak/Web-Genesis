object false
node :success do 
	true
end
node :data do
	{ 
		:id => @device.merchant_venue.auth_code,
		:venue_id => @device.merchant_venue.id,
		:venue_name => @device.merchant_venue.name
	}
end