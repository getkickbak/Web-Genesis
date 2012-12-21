object false
node :success do 
	true
end
node :data do
	{ 
		:id => @device.encryption_key,
		:venue_id => @device.merchant_venue.id,
		:venue_name => @device.merchant_venue.name
	}
end