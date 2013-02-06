object false
node :success do 
	true
end

node :metaData do
	{ 
		:csrf_token => form_authenticity_token,
		:auth_token => @user.authentication_token,
		:account => partial('api/v1/account/base', :object => @user)
	}
end	
node :total do 
	@results[:total]
end	