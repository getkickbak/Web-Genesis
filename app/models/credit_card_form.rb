class CreditCardForm
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  attr_accessor :id, :name, :number, :expiry_date, :security_code, :address, :city, :state, :zip
  
  validates :name, :presence => true
  validates :number, :presence => true
  validates :expiry_date, :presence => true
  validates :security_code, :presence => true
  validates :address, :presence => true
  validates :city, :presence => true
  validates :state, :presence => true
  validates :zip, :presence => true
  
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