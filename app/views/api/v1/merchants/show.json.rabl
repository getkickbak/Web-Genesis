object @merchant
attributes :id, :name, :photo, :alt_photo, :prize_terms
child :type do
	extends 'api/v1/merchants/type'
end