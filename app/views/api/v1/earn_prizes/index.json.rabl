object false
node :success do 
	true
end
node :data do
	@earn_prizes.map do |r|
		partial('api/v1/earn_prizes/show', :object => r) 
	end
end	
node :total do 
	@earn_prizes.length
end	