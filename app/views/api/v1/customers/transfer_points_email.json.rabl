object false
node :success do 
	true
end
node :metaData do
	{
		:data => {
			:subject => @subject,
			:body => @body,
			:qrcode => @encrypted_data
		}
	}
end