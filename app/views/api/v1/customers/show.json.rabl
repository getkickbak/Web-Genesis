object false
node :success do 
	true
end
node :data do
	partial('api/v1/customers/base', :object => @customer) 
end