object false
node :success do 
	true
end
node :metaData do
	{ 
		:csrf_token => form_authenticity_token,
		:auth_token => current_user.authentication_token
	}
end