object false
node :success do 
	true
end
node :data do
	partial('business/api/v1/customer_rewards/base', :object => @decrypted_data) 
end