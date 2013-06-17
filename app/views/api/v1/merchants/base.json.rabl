 object @merchant
attributes :id, :name, :reward_terms
child( { :photo => :photo } ) do
	extends 'api/v1/common/photo_uploader'
end
child( { :alt_photo => :alt_photo } ) do
	extends 'api/v1/common/photo_uploader'
end
child( { :eager_load_type => :type } ) do
	extends 'api/v1/merchants/type'
end
child( { :features_config => :features_config } ) do
	extends 'api/v1/common/merchant_features_config'
end