object false
node :success do 
	true
end
node :data do
	@results[:items].map do |r|
		partial('api/v1/customers/base_min', :object => r) 
	end
end
node :metaData do
	{ 
		:csrf_token => form_authenticity_token,
		:auth_token => @user.authentication_token,
		:virutal_tag_id => @user.virtual_tag.tag_id
	}
end	
node :total do 
	@results[:total]
end	