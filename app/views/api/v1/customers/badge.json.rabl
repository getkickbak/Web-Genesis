object @badge
attributes :id, :visits, :rank
child( { :custom_type => :type }, :if => lambda { |m| m.custom } ) do
	extends 'api/v1/customers/badge_type'
end
child( { :eager_load_type => :type }, :if => lambda { |m| !m.custom } ) do
	extends 'api/v1/customers/badge_type'
end