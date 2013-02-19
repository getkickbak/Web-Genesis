require 'util/constant'

class Promotion
  include DataMapper::Resource
    
  property :id, Serial
  property :subject, String, :length => 128, :required => true, :default => ""
  property :message, String, :required => true, :default => ""
  property :photo, String, :auto_validation => false
  property :start_date, Date, :default => ::Constant::MIN_DATE
  property :end_date, Date, :default => ::Constant::MIN_DATE
  property :status, Enum[:pending, :delivered], :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :start_date_str, :end_date_str
  attr_accessible :subject, :message, :photo, :start_date, :end_date   
    
  validates_with_method :start_date, :method => :validate_start_date
  validates_with_method :end_date, :method => :validate_end_date
  
  mount_uploader :photo, PromotionPhotoUploader
  
  belongs_to :merchant
  
  def self.create(merchant, promotion_info)
    now = Time.now
    promotion = Promotion.new(
      :subject => promotion_info[:subject].strip,
      :message => promotion_info[:message].strip,
      :photo => promotion_info[:photo],
      :start_date => now.to_date,
      :end_date => now.to_date
    )
    promotion.start_date_str = promotion_info[:start_date]
    # End date set to start date for now
    promotion.end_date_str = promotion_info[:end_date]
    promotion[:created_ts] = now
    promotion[:update_ts] = now
    promotion.merchant = merchant
    Rails.logger.info("Before save promotion")
    promotion.save
    Rails.logger.info("After save promotion")
    return promotion
  end
  
  private
  
  def convert_date(field, field_str)
    begin
      date_str = self.send(field_str)
      if date_str
        self[field] = Time.zone.parse(date_str).to_date
      end  
      return true
    rescue ArgumentError
      return false
    end
  end
  
  def validate_date(n,v)
    convert_date(n.to_sym, v) ? true : [false, "#{n.gsub('_',' ').capitalize} #{I18n.t('errors.messages.not_valid')}"] 
  end
  
  def validate_start_date
    valid = validate_date("start_date", "start_date_str")
    return valid if valid.kind_of?(Array)
      
    today = Date.today
    if self.start_date < today
      return [false, I18n.t('business.promotions.min_start_date')]
    end
    return true  
  end
  
  def validate_end_date
    valid = validate_date("end_date", "end_date_str")
    return valid if valid.kind_of?(Array)
    
    if self.end_date < self.start_date
      return [false, I18n.t('business.promotions.min_end_date')]
    end      
    return true 
  end
end