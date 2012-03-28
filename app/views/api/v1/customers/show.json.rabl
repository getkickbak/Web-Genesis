object @customer
attributes :points
child(:last_check_in, :if => lambda { |m| m.last_check_in }) do |m|
  extends 'api/v1/check_ins/show'
end
child :merchant do
	extends 'api/v1/merchants/show'
end