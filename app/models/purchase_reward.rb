class PurchaseReward
  include DataMapper::Resource

  property :id, Serial
  property :title, String, :required => true, :default => ""
  property :price, Integer, :required => true
  property :reward_ratio, Integer, :required => true
  property :points, Integer, :required => true
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id
  attr_accessor :venue_ids

  attr_accessible :type_id, :title, :price, :reward_ratio, :points

  belongs_to :merchant
  has 1, :purchase_reward_to_type
  has 1, :type, 'PurchaseRewardType', :through => :purchase_reward_to_type, :via => :purchase_reward_type
  has n, :purchase_reward_venues
  has n, :venues, :through => :purchase_reward_venues

  validates_presence_of :type_id
  validates_with_method :check_price
  validates_with_method :check_reward_ratio
  validates_with_method :check_points
  
  def self.create(merchant, type, reward_info, venues)
    now = Time.now
    reward = PurchaseReward.new(
      :type_id => type ? type.id : nil,
      :title => reward_info[:title],
      :price => reward_info[:price],
      :reward_ratio => reward_info[:reward_ratio],
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
    self.reward_ratio = reward_info[:reward_ratio]
    self.points = reward_info[:points]
    self.update_ts = now
    self.type = type
    self.purchase_reward_venues.destroy
    self.venues.concat(venues)
    save
  end

  def as_json(options)
    only = {:only => [:id,:title,:points]}
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
  
  def check_reward_ratio
    if self.reward_ratio.is_a? Integer
      return self.reward_ratio > 0 ? true : [false, "Reward ratio must be greater than 0"]
    end
    return true
  end
  
  def check_points
    if self.points.is_a? Integer
      return self.points > 0 ? true : [false, "Points must be greater than 0"]
    end
    return true
  end
end