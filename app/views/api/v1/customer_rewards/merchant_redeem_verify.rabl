object false
node :success do 
	true
end
node :data do
	partial('api/v1/customer_rewards/base', :object => @customer_reward) 
end