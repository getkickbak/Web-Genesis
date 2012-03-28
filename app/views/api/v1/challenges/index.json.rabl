object false
node :success do 
	true
end
node :data do
	@challenges.map do |r|
		partial('api/v1/challenges/base', :object => r) 
	end
end
node :total do
	@challenges.length
end