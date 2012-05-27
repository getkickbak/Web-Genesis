object false
node :success do 
	true
end
node :metaData do
	partial('api/v1/customers/base', :object => @customer)
end