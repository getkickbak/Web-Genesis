class LotteryData
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  attr_accessor :odds
  
  validates :odds, :presence => true
  validates_numericality_of :odds, :only_integer => true
  validate :check_odds
  
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
    only = {:only => [:odds]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def check_odds
    self.odds = self.odds.to_i
    errors.add(:odds, "Odds must be greater than 0") unless self.odds > 0
  end
end