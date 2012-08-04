class CustomerToBadge
  include DataMapper::Resource

  belongs_to :customer, :key => true
  belongs_to :badge, :key => true
end