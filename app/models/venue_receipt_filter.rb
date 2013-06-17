class VenueReceiptFilter
  include DataMapper::Resource

  belongs_to :venue_features_config, :key => true
  belongs_to :receipt_filter, :key => true
end