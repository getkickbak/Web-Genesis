object false
node :success do 
	true
end
node :data do
	@results[:items].map do |r|
		partial('api/v1/customers/base_min', :object => r) 
	end
end	
node :total do 
	@results[:total]
end	