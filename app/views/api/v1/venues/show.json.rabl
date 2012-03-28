object @venue
attributes :id, :name, :longitude, :latitude, :distance
child :type do
	extends 'api/v1/venues/type'
end
child :merchant do
	extends 'api/v1/merchants/show'
end