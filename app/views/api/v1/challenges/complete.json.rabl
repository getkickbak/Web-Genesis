object false
node :success do 
	true
end
node :metaData do
	{ 
		:account_info => @account_info, 
		:reward_info => @reward_info,
		:message => (@msg if defined? @msg)
	}.delete_if { |k,v| v.nil? }		 	
end