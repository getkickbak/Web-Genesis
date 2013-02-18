class CreditCardForm
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  attr_accessor :id, :type, :name, :number, :expiry_date, :security_code, :address, :city, :state, :zipcode, :country
  
  validates :name, :presence => true
  validates :number, :presence => true
  validates :expiry_date, :presence => true
  validates :security_code, :presence => true
  validates :address, :presence => true
  validates :city, :presence => true
  validates :state, :presence => true
  validates :zipcode, :presence => true
  validates :country, :presence => true
  
  def initialize(attributes = {})
    @attributes = attributes
    if (not @attributes.empty?) && (not @attributes.include? :expiry_date)
      date_str = "#{@attributes['expiry_date(1i)']}-#{@attributes['expiry_date(2i)']}-#{@attributes['expiry_date(3i)']}"
      @attributes['expiry_date'] = Time.zone.parse(date_str).to_date
      @attributes.delete('expiry_date(1i)')
      @attributes.delete('expiry_date(2i)')
      @attributes.delete('expiry_date(3i)')
    end
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