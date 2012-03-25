class PurchaseReward
  include DataMapper::Resource

  property :id, Serial
  property :title, String, :length => 24, :required => true, :default => ""
  property :price, Decimal, :required => true, :scale => 2
  property :rebate_rate, Integer, :required => true
  property :points, Integer, :required => true
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

  validates_presence_of :type_id, :on => :save
  validates_with_method :check_price
  validates_with_method :check_rebate_rate
  validates_with_method :points, :methods => :check_points
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

  def as_json(options)
    only = {:only => [:id,:title,:points], :methods => [:type]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  def destroy
    self.purchase_reward_venues.destroy
    super  
  end
  
  private

  def check_price
    if self.price.is_a? Decimal
      return self.price > 0.0 ? true : [false, "Price must be greater than 0"]  
    end
    return true
  end
  
  def check_rebate_rate
    if self.rebate_rate.is_a? Integer
      return self.rebate_rate > 0 ? true : [false, "Rebate rate must be greater than 0"]
    end
    return true
  end
  
  def check_points
    if self.points.is_a? Integer
      return self.points > 0 ? true : [false, "Points must be greater than 0"]
    end
    return true
  end
  
  def check_venues
    if self.venues.length == 0
      return [false, "Must belong to at least one venue"]
    end
    return true
  end
end