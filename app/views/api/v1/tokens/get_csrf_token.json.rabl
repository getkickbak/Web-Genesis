object false
node :success do 
	true
end
node :metaData do
	{ 
		:csrf_token => form_authenticity_token,
		:auth_token => current_user.authentication_token,
		:virtual_tag_id => current_user.virtual_tag.tag_id,
		:account => partial('api/v1/account/base', :object => @user)
	}
end