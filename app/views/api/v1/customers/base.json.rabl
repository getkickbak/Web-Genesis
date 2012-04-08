object @customer
attributes :id, :points
child( { :last_check_in => :last_check_in } do
  extends 'api/v1/check_ins/base'
end
child :merchant do
	extends 'api/v1/merchants/base'
end