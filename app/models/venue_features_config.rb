class VenueFeaturesConfig
  include DataMapper::Resource

  property :id, Serial
  property :use_custom, Boolean, :default => false
  property :enable_pos, Boolean, :default => false
  property :enable_sku_data_upload, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :use_custom, :enable_pos, :enable_sku_data_upload, :receipt_filter_attributes

  belongs_to :venue

  has 1, :venue_receipt_filter, :constraint => :destroy
  has 1, :receipt_filter, :through => :venue_receipt_filter, :via => :receipt_filter

  accepts_nested_attributes_for :receipt_filter

  def self.create(venue, merchant_features_config)
    now = Time.now
    features_config = VenueFeaturesConfig.new(
      :enable_pos => merchant_features_config.enable_pos,
      :enable_sku_data_upload => merchant_features_config.enable_sku_data_upload
    )
    features_config[:created_ts] = now
    features_config[:update_ts] = now
    features_config.receipt_filter = ReceiptFilter.new(merchant_features_config.receipt_filter.attributes.merge(:id => nil))
    features_config.venue = venue
    features_config.save
    return features_config
  end  
  
  def update(features_config_info)
    now = Time.now
    self.use_custom = features_config_info[:use_custom]
    self.enable_pos = features_config_info[:enable_pos] if features_config_info.include? :enable_pos
    self.enable_sku_data_upload = features_config_info[:enable_sku_data_upload]
    features_config_info[:receipt_filter_attributes].each do |attr, val|
      self.receipt_filter[attr] = val
    end
    self.update_ts = now
    save
  end
end