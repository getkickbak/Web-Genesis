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

  attr_accessor :venue_ids

  attr_accessible :title, :price, :reward_ratio, :points

  belongs_to :merchant
  has n, :purchase_reward_venues
  has n, :venues, :through => :purchase_reward_venues

  validates_with_method :check_points
  
  def self.create(merchant, reward_info, venues)
    now = Time.now
    reward = PurchaseReward.new(
    :title => reward_info[:title],
    :price => reward_info[:price],
    :reward_ratio => reward_info[:reward_ratio],
    :points => reward_info[:points]
    )
    reward[:created_ts] = now
    reward[:update_ts] = now
    reward.merchant = merchant
    reward.venues.concat(venues)
    reward.save
    return reward
  end

  def update(reward_info, venues)
    now = Time.now
    self.title = reward_info[:title]
    self.price = reward_info[:price]
    self.reward_ratio = reward_info[:reward_ratio]
    self.points = reward_info[:points]
    self.update_ts = now
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

  def check_points
    self.points > 0 ? true : [false, "Points must be greater than 0"]
  end
end