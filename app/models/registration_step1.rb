class RegistrationStep1
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
    
  attr_accessor :phone_number
  
  validates :phone_number, :presence => true
  validate :validate_unique_phone 
  
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
  
  private
  
  def validate_unique_phone
    if not phone_number.empty?
      phone = phone_number.gsub(/\-/, "")
      if User.first(:phone => phone)
        errors.add(:phone_number, I18n.t('errors.taken', :attribute => self.class.human_attribute_name(:phone_number)))
      end
    end
  end
end