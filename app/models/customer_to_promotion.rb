class CustomerToPromotion
  include DataMapper::Resource

  belongs_to :customer, :key => true
  belongs_to :promotion, :key => true
end