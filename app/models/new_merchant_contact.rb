class NewMerchantContact
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
    
  attr_accessor :name, :email, :merchant_name, :address, :city, :state, :phone, :message
  
  validates :name, :presence => true
  validates :email, :presence => true, :email_format => true
  validates :merchant_name, :presence => true
  validates :address, :presence => true
  validates :city, :presence => true
  validates :state, :presence => true
  validates :phone, :presence => true
  validates :message, :presence => true
  
  def self.topic_list
    @@topic_list
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