class SiteConfiguration
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming

  attr_accessor :sms_provider
  
  def initialize(attributes = {})
    @attributes = attributes
    @attributes.each do |key,value|
      send "#{key}=".to_sym, value
    end
  end
  
  def read_attribute_for_validation(key)
    @attributes[key]
  end

  def persisted?
    false
  end
end