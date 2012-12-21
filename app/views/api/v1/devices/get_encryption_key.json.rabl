object false
node :success do 
	true
end
node :data do
	@device.encryption_key
end
node :metaData do
	{ 
		:venue_id => @device.merchant_venue.id,
		:venue_name => @device.merchant_venue.name
	}
end