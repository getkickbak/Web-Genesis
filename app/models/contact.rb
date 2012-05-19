class Contact
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  @@topic_list = [
      ['Login issues', 'Login issues'],
      ['Reward issues','Reward issues'],
      ['General inquiry', 'General inquiry'],
      ['Suggest a business', 'Suggest a business']
    ]
  
  @@merchant_topic_list = [
      ['Login issues', 'Login issues'],
      ['Reward issues','Reward issues'],
      ['Payment issues','Payment issues'],
      ['General inquiry', 'General inquiry']
    ] 
    
  attr_accessor :name, :email, :topic, :message
  
  validates :name, :presence => true
  validates :email, :presence => true, :email_format => true
  validates :topic, :presence => true
  validates :message, :presence => true
  
  def self.topic_list
    @@topic_list
  end
  
  def self.merchant_topic_list
    @@merchant_topic_list
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