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
    
  validates_presence_of :name, :email, :topic, :description
 
  attr_accessor :name, :email, :topic, :description
  
  def self.topic_list
    @@topic_list
  end
  
  def initialize(attributes = {})
    @attributes = attributes
  end
 
  def read_attribute_for_validation(key)
    @attributes[key]
  end
  
  def persisted?
    false
  end
end