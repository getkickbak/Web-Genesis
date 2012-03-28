object false
node :success do 
	true
end
node :data do
	@prizes.map do |r|
		attributes :created_ts	 
		child :reward do
			attributes :title
		end
		child :user do
			attributes :name
		end	 
	end
end
node :total do
	@prizes.length
end