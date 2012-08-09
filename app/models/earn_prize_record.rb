require 'util/constant'

class EarnPrizeRecord
  include DataMapper::Resource

  property :id, Serial
  property :type, Enum[:game, :badge], :required => true, :default => :game
  property :venue_id, Integer, :required => true, :default => 0
  property :points, Integer, :required => true, :default => 0
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :type, :venue_id, :points, :created_ts, :update_ts
  
  belongs_to :merchant
  belongs_to :customer
  belongs_to :user
end