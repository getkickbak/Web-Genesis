object false
node :success do 
	true
end
node :data do
	partial('api/v1/customers/base', :object => @customer) 
end
node :metaData do
	{
		account => partial('api/v1/account/base', :object => @user)
	}
end