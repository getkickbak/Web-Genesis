object false
node :success do 
	true
end
node :data do
	partial('business/api/v1/common/redeem_reward', :object => @decrypted_data) 
end