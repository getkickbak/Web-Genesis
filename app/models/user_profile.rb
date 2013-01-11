require 'util/constant'

class UserProfile
  include DataMapper::Resource
  
  property :id, Serial
  property :gender, Enum[:m, :f, :u], :default => :u
  property :birthday, Date, :default => ::Constant::MIN_DATE
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :birthday_str
  attr_accessible :gender, :birthday
  
  belongs_to :user
  
  validates_with_method :birthday, :method => :validate_birthday
  
  def update(profile_info)
    now = Time.now
    self.attributes = profile_info
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
  
  def validate_birthday
    return validate_date("birthday", "birthday_str")
  end
end