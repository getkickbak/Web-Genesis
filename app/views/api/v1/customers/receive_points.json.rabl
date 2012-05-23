object false
node :success do 
	true
end
node :data do
	partial('api/v1/customers/base', :object => @customer) 
end
node :metaData do
	{
		:points => @points
	}
end