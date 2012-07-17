object @photo_uploader
attributes :url
child( { :thumbnail_ios_medium => :thumbnail_ios_medium }) do
	extends 'api/v1/common/photo_uploader_version'
end
child( { :thumbnail_ios_small => :thumbnail_ios_small }) do
	extends 'api/v1/common/photo_uploader_version'
end