class CustomerReward
  include DataMapper::Resource
  
  Modes = [:reward_only, :prize_only, :prize_and_reward]

  property :id, Serial
  property :title, String, :length => 24, :required => true, :default => ""
  property :price, Decimal, :required => true, :scale => 2, :min => 1.00
  property :points, Integer, :required => true, :min => 1
  property :mode, Enum[:reward_only, :prize_only, :prize_and_reward], :required => true, :default => :prize_and_reward
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id
  attr_accessor :venue_ids
  attr_accessor :eager_load_type

  attr_accessible :type_id, :title, :price, :points, :mode

  belongs_to :merchant
  has 1, :customer_reward_to_type, :constraint => :destroy
  has 1, :type, 'CustomerRewardType', :through => :customer_reward_to_type,  :via => :customer_reward_type
  has n, :customer_reward_venues, :constraint => :destroy
  has n, :venues, :through => :customer_reward_venues

  validates_with_method :type_id, :method => :check_type_id
  validates_with_method :check_venues
  
  def self.create(merchant, type, reward_info, venues)
    now = Time.now
    reward = CustomerReward.new(
      :type_id => type ? type.id : nil,
      :title => reward_info[:title].strip,
      :price => reward_info[:price],
      :points => reward_info[:points],
      :mode => reward_info[:mode]
    )
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
    self.update_ts = now
    self.type = type
    self.customer_reward_venues.destroy
    self.venues.concat(venues)
    save
  end
  
  def to_redeemed
    type = {
      :value => RedeemedReward::TYPE_REWARD
    }
    RedeemedReward.new(type, self.title)
  end
  
  def destroy
    self.customer_reward_venues.destroy
    super  
  end
  
  private
  
  def check_type_id
    if self.type && self.type.id
      return true  
    end
    return [false, ValidationErrors.default_error_message(:blank, :type_id)]
  end
  
  def check_venues
    if self.venues.length == 0
      return [false, I18n.t("errors.messages.customer_reward.min_venues")]
    end
    return true
  end
end