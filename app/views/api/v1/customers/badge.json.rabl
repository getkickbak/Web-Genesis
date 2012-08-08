object @badge
attributes :id, :visits, :rank
if @badge.custom
	child( { :custom_type => :type } ) do
		extends 'api/v1/customers/badge_type'
	end
else
	child( { :eager_load_type => :type } ) do
		extends 'api/v1/customers/badge_type'
	end
end