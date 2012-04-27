class PurchaseReward
  include DataMapper::Resource

  property :id, Serial
  property :title, String, :length => 24, :required => true, :default => ""
  property :price, Decimal, :required => true, :scale => 2, :min => 1.00
  property :rebate_rate, Integer, :required => true, :min => 1
  property :points, Integer, :required => true, :min => 1
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id
  attr_accessor :venue_ids

  attr_accessible :type_id, :title, :price, :rebate_rate, :points

  belongs_to :merchant
  has 1, :purchase_reward_to_type, :constraint => :destroy
  has 1, :type, 'PurchaseRewardType', :through => :purchase_reward_to_type, :via => :purchase_reward_type
  has n, :purchase_reward_venues, :constraint => :destroy
  has n, :venues, :through => :purchase_reward_venues

  validates_with_method :type_id, :method => :check_type_id
  validates_with_method :check_venues
  
  def self.create(merchant, type, reward_info, venues)
    now = Time.now
    reward = PurchaseReward.new(
      :type_id => type ? type.id : nil,
      :title => reward_info[:title].strip,
      :price => reward_info[:price],
      :rebate_rate => reward_info[:rebate_rate],
      :points => reward_info[:points]
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
    self.rebate_rate = reward_info[:rebate_rate]
    self.points = reward_info[:points]
    self.update_ts = now
    self.type = type
    self.purchase_reward_venues.destroy
    self.venues.concat(venues)
    save
  end
  
  def destroy
    self.purchase_reward_venues.destroy
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
      return [false, I18n.t("errors.messages.purchase_reward.min_venues")]
    end
    return true
  end
end