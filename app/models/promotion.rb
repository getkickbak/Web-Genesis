require 'util/constant'

class Promotion
  include DataMapper::Resource
    
  property :id, Serial
  property :message, String, :required => true, :default => ""
  property :start_date, Date, :default => ::Constant::MIN_DATE
  property :end_date, Date, :default => ::Constant::MIN_DATE
  property :status, Enum[:pending, :delivered], :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :start_date_str, :end_date_str
  attr_accessible :message, :start_date, :end_date   
  
  validates_with_method :validate_start_date, :validate_end_date
  
  belongs_to :merchant
  
  def self.create(merchant, promotion_info)
    now = Time.now
    dates = ["start_date","end_date"]
    r = {}
    dates.each do |d|
      r[d] = promotion_info[d+"(1i)"]+'-'+promotion_info[d+"(2i)"]+'-'+promotion_info[d+"(3i)"]
    end
    promotion = Promotion.new(
      :message => promotion_info[:message].strip,
      :start_date => now.to_date,
      :end_date => now.to_date
    )
    promotion.start_date_str = r["start_date"]
    promotion.end_date_str = r["end_date"]
    promotion[:created_ts] = now
    promotion[:update_ts] = now
    promotion.merchant = merchant
    promotion.save
    return reward
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
  
  def validate_start_date
    validate_date("start_date", "start_date_str")
  end
  
  def validate_end_date
    validate_date("end_date", "end_date_str")
  end
  
  def validate_date(n,v)
    convert_date(n.to_sym, v) ? true : [false, "#{n.gsub('_',' ').capitalize} #{I18n.t('errors.messages.not_valid')}"] 
  end
end