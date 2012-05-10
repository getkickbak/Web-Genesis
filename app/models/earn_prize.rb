require 'util/constant'

class EarnPrize
  include DataMapper::Resource

  property :id, Serial
  property :points, Integer, :required => true, :default => 0
  property :redeemed, Boolean, :default => false
  property :expiry_date, Date, :required => true, :default => ::Constant::MIN_DATE
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :points, :expiry_date, :created_ts
  
  belongs_to :reward, 'CustomerReward'
  belongs_to :merchant
  belongs_to :venue
  belongs_to :user
  
  def to_redeemed
    type = {
      :value => RedeemedReward::TYPE_PRIZE
    }
    RedeemedReward.new(type, reward.title)
  end
end