object false
node :success do 
	true
end
node :data do
	partial('api/v1/customers/show', :object => @customer) 
end