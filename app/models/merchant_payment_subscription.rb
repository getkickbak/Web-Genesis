require 'util/constant'

class MerchantPaymentSubscription
  include DataMapper::Resource
  
  PlanType = [:wifi, :internet]
  
  property :id, Serial
  property :plan_type, Enum[:wifi, :internet], :default => :wifi
  property :plan_id, Integer, :default => 1
  property :balance, Decimal, :scale => 2, :default => 0.00
  property :start_date, Date, :default => ::Constant::MIN_DATE
  property :end_date, Date, :default => ::Constant::MAX_DATE
  property :paid_through_date, Date, :default => ::Constant::MIN_TIME
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :start_date_str, :end_date_str
  attr_accessible :type, :plan_id, :amount, :balance, :start_date, :end_date, :paid_through_date
  
  validates_with_method :start_date, :method => :validate_start_date
  validates_with_method :end_date, :method => :validate_end_date
  
  belongs_to :merchant
  
  def self.create(merchant)
    now = Time.now
    subscription = MerchantPaymentSubscription.new
    subscription[:created_ts] = now
    subscription[:update_ts] = now
    subscription.merchant = merchant
    subscription.save
    return subscription  
  end
  
  def update(subscription_info)
    now = Time.now
    self.plan_type = subscription_info[:plan_type] if subscription_info.include? :plan_type
    self.plan_id = subscription_info[:plan_id] if subscription_info.include? :plan_id
    self.balance = subscription_info[:balance] if subscription_info.include? :balance
    self.start_date_str = subscription_info[:start_date] if subscription_info.include? :start_date
    self.end_date_str = subscription_info[:end_date] if subscription_info.include? :end_date
    self.paid_through_date = subscription_info[:paid_through_date] if subscription_info.include? :paid_through_date
    self.update_ts = now
    save
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
    return validate_date("start_date", "start_date_str")
  end
  
  def validate_end_date
    valid = validate_date("end_date", "end_date_str")
    return valid if valid.kind_of?(Array)
    
    if self.end_date < self.start_date
      return [false, I18n.t('admin.merchants.min_end_date')]
    end      
    return true 
  end
end