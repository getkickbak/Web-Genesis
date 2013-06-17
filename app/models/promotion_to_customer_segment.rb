class PromotionToCustomerSegment
  include DataMapper::Resource

  belongs_to :promotion, :key => true
  belongs_to :customer_segment, :key => true
end