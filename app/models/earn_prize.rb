require 'util/constant'

class EarnPrize
  include DataMapper::Resource

  property :id, Serial
  property :points, Integer, :required => true, :default => 0
  property :redeemed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :points, :created_ts
  
  belongs_to :reward, 'PurchaseReward'
  belongs_to :merchant
  belongs_to :user
  
  def as_json(options)
    only = {:only => [:id], :methods => [:merchant, :reward]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
end