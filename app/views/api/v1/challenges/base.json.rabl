object @challenge
attributes :id, :name, :description, :require_verif, :points
child( { :eager_load_type => :type } ) do
	extends 'api/v1/challenges/type'
end