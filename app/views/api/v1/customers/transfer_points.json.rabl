object false
node :success do 
	true
end
if @type == "email"
	node :metaData do
		{
			:data => {
				:subject => @subject,
				:body => @body,
				:qrcode => @encrypted_data
			}
		}
	end
else
	node :metaData do
		{
			:data => @encrypted_data
		}
	end
end