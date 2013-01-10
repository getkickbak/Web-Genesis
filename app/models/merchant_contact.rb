class MerchantContact
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  @@states = [
      ['BC', 'BC'],
      ['Alberta', 'Alberta'],
      ['Saskatchewan', 'Saskatchewan'],
      ['Manitoba','Manitoba'],
      ['Ontario', 'Ontario'],
      ['Quebec', 'Quebec'],
      ['Newfoundland', 'Newfoundland'],
      ['New Brunswick', 'New Brunswick'],
      ['PEI', 'PEI'],
      ['Nova Scotia', 'Nova Scotia']
    ]
    
  attr_accessor :name, :email, :business_name, :address, :city, :province, :phone, :message
  
  validates :name, :presence => true
  validates :email, :presence => true, :email_format => true
  validates :business_name, :presence => true
  validates :address, :presence => true
  validates :city, :presence => true
  validates :province, :presence => true
  validates :phone, :presence => true, :phone_format => true
  
  def self.states
    @@states
  end
  
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