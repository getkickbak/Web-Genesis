class Contact
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  @@topic_list = [
      ['Login issues', 'Login issues'],
      ['Order issues', 'Order issues'],
      ['Payment issues','Payment issues'],
      ['General inquiry', 'General inquiry'],
      ['Suggest a business', 'Suggest a business']
    ]
     
  attr_accessor :name, :email, :topic, :description
  
  validates :name, :presence => true
  validates :email, :presence => true, :email_format => true
  validates :topic, :presence => true
  validates :description, :presence => true
  
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