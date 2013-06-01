class MerchantReceiptFilter
  include DataMapper::Resource

  belongs_to :merchant_features_config, :key => true
  belongs_to :receipt_filter, :key => true
end