class MerchantFeaturesConfig
  include DataMapper::Resource

  property :id, Serial
  property :enable_prizes, Boolean, :default => true
  property :enable_pos, Boolean, :default => false
  property :enable_sku_data_upload, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :enable_prizes, :enable_pos, :enable_sku_data_upload, :receipt_filter_attributes

  belongs_to :merchant

  has 1, :merchant_receipt_filter, :constraint => :destroy
  has 1, :receipt_filter, :through => :merchant_receipt_filter, :via => :receipt_filter

  accepts_nested_attributes_for :receipt_filter
  
  def self.create(merchant)
    now = Time.now
    features_config = MerchantFeaturesConfig.new
    features_config[:created_ts] = now
    features_config[:update_ts] = now
    features_config.receipt_filter = ReceiptFilter.new
    features_config.merchant = merchant
    features_config.save
    return features_config
  end

  def update(features_config_info)
    now = Time.now
    self.enable_prizes = features_config_info[:enable_prizes]
    self.enable_pos = features_config_info[:enable_pos] if features_config_info.include? :enable_pos
    self.enable_sku_data_upload = features_config_info[:enable_sku_data_upload]
    features_config_info[:receipt_filter_attributes].each do |attr, val|
      self.receipt_filter[attr] = val
    end
    self.update_ts = now
    save
  end
end