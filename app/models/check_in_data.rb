class CheckInData
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  attr_accessor :visits_per_month
  
  validates :visits_per_month, :presence => true
  validates_numericality_of :visits_per_month, :only_integer => true
  validate :check_visits_per_month
  
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
  
  def check_visits_per_month
    if visits_per_month.is_a? Integer
      errors.add(:base, "Visits per month must be greater than 0") unless visits_per_month > 0
    end
  end
end