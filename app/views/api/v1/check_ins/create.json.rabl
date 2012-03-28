object false
node :success do 
	true
end
if @customer.nil?
	node :data do
		partial('api/v1/customers/base', :object => Customer.new) 
	end
else
	node :data do
		partial('api/v1/customers/base', :object => @customer) 
	end
	node :metaData do
		node :prizes do
			@prizes.map do |r|
				partial('api/v1/earn_prizes/base', :object => r)
			end
		end
		node :eligible_rewards do
			@eligible_rewards.map do |r|
		 		partial('api/v1/customer_rewards/base', :object => r)
			end
		end		 	
	end
end