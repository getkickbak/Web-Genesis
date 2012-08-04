object @badge
attributes :id, :visits, :rank
child( { :eager_load_type => :type } ) do
	extends 'api/v1/customers/badge_type'
end