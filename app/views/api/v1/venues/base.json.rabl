object @venue
attributes :id, :name, :description, :address, :city, :state, :zipcode, :country, :phone, :website, :longitude, :latitude, :distance
child( { :eager_load_type => :type } ) do
	extends 'api/v1/venues/type'
end
child :merchant do
	extends 'api/v1/merchants/base'
end