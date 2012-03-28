object false
node :success do 
	true
end
node :data do
	@venues.map do |r|
		partial('api/v1/venues/base', :object => r) 
	end
end	
node :total do 
	@venues.length
end	