class CustomerReward
  include DataMapper::Resource
  
  Modes = [:reward, :prize]

  property :id, Serial
  property :title, String, :length => 40, :required => true, :default => ""
  property :price, Decimal, :required => true, :scale => 2, :min => 1.00
  property :points, Integer, :required => true, :min => 1
  property :mode, Enum[:reward, :prize], :required => true, :default => :reward
  property :quantity_limited, Boolean, :required  => true, :default => false
  property :quantity, Integer, :default => 0
  property :quantity_count, Integer, :default => 0
  property :time_limited, Boolean, :required => true, :default => false
  property :expiry_date, Date, :default => ::Constant::MIN_DATE
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id, :venue_ids, :eager_load_type, :expiry_date_str

  attr_accessible :type_id, :title, :price, :points, :mode, :quantity_limited, :quantity, :time_limited, :expiry_date

  belongs_to :merchant
  has 1, :customer_reward_to_subtype, :constraint => :destroy
  has 1, :type, 'CustomerRewardSubtype', :through => :customer_reward_to_subtype,  :via => :customer_reward_subtype
  has n, :customer_reward_venues, :constraint => :destroy
  has n, :venues, :through => :customer_reward_venues

  validates_with_method :type_id, :method => :check_type_id
  validates_with_method :expiry_date, :method => :validate_expiry_date
  validates_with_method :check_venues
  
  def self.create(merchant, type, reward_info, venues)
    now = Time.now
    reward = CustomerReward.new(
      :type_id => type ? type.id : nil,
      :title => reward_info[:title].strip,
      :price => reward_info[:price],
      :points => reward_info[:points],
      :mode => reward_info[:mode],
      :quantity_limited => reward_info[:quantity_limited],
      :quantity => reward_info[:quantity_limited] ? reward_info[:quantity] : 0,
      :time_limited => reward_info[:time_limited],
      :expiry_date => now.to_date
    )
    reward.expiry_date_str = reward_info[:time_limited] ? reward_info[:expiry_date] : ""
    reward[:created_ts] = now
    reward[:update_ts] = now
    reward.merchant = merchant
    reward.type = type
    reward.venues.concat(venues)
    reward.save
    return reward
  end

  def update(type, reward_info, venues)
    now = Time.now
    self.type_id = type ? type.id : nil
    self.title = reward_info[:title]
    self.price = reward_info[:price]
    self.points = reward_info[:points]
    self.mode = reward_info[:mode]
    self.quantity_limited = reward_info[:quantity_limited]
    self.quantity = reward_info[:quantity_limited] ? reward_info[:quantity] : 0
    self.time_limited = reward_info[:time_limited]
    self.expiry_date_str = reward_info[:time_limited] ? reward_info[:expiry_date] : ""
    self.update_ts = now
    self.type = type
    self.customer_reward_venues.destroy
    self.venues.concat(venues)
    save
  end
  
  def to_redeemed
    type = {
      :value => self.mode == "reward" ? RedeemedReward::TYPE_REWARD : RedeemedReward::TYPE_PRIZE
    }
    RedeemedReward.new(type, self.title)
  end
  
  def destroy
    self.customer_reward_venues.destroy
    super  
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
  
  def check_type_id
    if self.type && self.type.id
      return true  
    end
    return [false, ValidationErrors.default_error_message(:blank, :type_id)]
  end
  
  def validate_date(n,v)
    convert_date(n.to_sym, v) ? true : [false, "#{n.gsub('_',' ').capitalize} #{I18n.t('errors.messages.not_valid')}"] 
  end
  
  def validate_expiry_date
    if self.time_limited
      valid = validate_date("expiry_date", "expiry_date_str")
      return valid if valid.kind_of?(Array)
      
      today = Date.today
      if self.expiry_date < today
        return [false, I18n.t('business.customer_rewards.min_expiry_date')]
      end
    end
    return true  
  end
  
  def check_venues
    if self.venues.length == 0
      return [false, I18n.t("errors.messages.customer_reward.min_venues")]
    end
    return true
  end
end