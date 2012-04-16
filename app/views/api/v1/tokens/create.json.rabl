object false
node :success do 
	true
end
node :data do
	@results[:items].map do |r|
		partial('api/v1/customers/base', :object => r) 
	end
end
node :metaData do
	{ 
		:auth_token => @user.authentication_token, 
		:prizes => @earn_prizes.map do |r|
						partial('api/v1/earn_prizes/base', :object => r)
					end
	}
end	
node :total do 
	@results[:total]
end	