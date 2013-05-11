class RegistrationStep1
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
    
  attr_accessor :phone_number
  
  validates :phone_number, :presence => true
  validate :validate_phone 
  
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
  
  def validate_phone
    if not phone_number.empty?
      phone = phone_number.gsub(/\-/, "")
      if !phone.match(/^[\d]+$/) || phone.length != 10
        errors.add(:phone_number, I18n.t('errors.messages.phone_format', :attribute => I18n.t('activemodel.attributes.contact.phone')) % [10])
      elsif (user = User.first(:phone => phone)) && user.status == :active
        errors.add(:phone_number, I18n.t('errors.taken', :attribute => User.human_attribute_name(:phone_number)))
      end
    end
  end
end