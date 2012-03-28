object false
node :success do 
	true
end
node :data do
	@results[:items].map do |r|
		partial('api/v1/customers/show', :object => r) 
	end
end	
node :total do 
	@results[:total]
end	