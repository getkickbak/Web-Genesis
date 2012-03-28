object false
node :success do 
	true
end
node :data do
	@results[:items].map do |r|
		partial('api/v1/customers/show', :object => r) 
	end
end
node :metaData do
	{ :auth_token => @user.authentication_token }
end	
node :total do 
	@results[:total]
end	