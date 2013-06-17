object @features_config
attributes :enable_prizes, :enable_pos, :enable_sku_data_upload
child( { :receipt_filter => :receipt_filter } ) do
	extends 'api/v1/common/receipt_filter'
end