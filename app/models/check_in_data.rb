class CheckInData
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  attr_accessor :visits
  
  validates :visits, :presence => true
  validates_numericality_of :visits, :only_integer => true
  validate :check_visits
  
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
  
  def as_json(options)
    only = {:only => [:visits]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def check_visits
    self.visits = self.visits.to_i
    errors.add(:visits, "Visits must be greater than 0") unless self.visits > 0
  end
end