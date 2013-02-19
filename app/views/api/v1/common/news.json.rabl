object @news
attributes :type, :item_id, :item_type, :title, :text
child( { :photo => :photo } ) do
	extends 'api/v1/common/photo_uploader'
end