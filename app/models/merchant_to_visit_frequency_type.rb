class MerchantToVisitFrequencyType
  include DataMapper::Resource

  belongs_to :merchant, :key => true
  belongs_to :visit_frequency_type, :key => true
end