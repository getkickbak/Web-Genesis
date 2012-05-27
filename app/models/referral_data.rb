class ReferralData
  include ActiveModel::Validations
  include ActiveModel::Conversion
  include ActiveModel::Naming
  
  attr_accessor :referral_points
  
  validates :referral_points, :presence => true
  validates_numericality_of :referral_points, :only_integer => true
  validate :check_referral_points
  
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
    only = {:only => [:referral_points]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def check_referral_points
    self.referral_points = self.referral_points.to_i
    errors.add(:referral_points, "Referral points must be greater than 0") unless self.referral_points > 0
  end
end