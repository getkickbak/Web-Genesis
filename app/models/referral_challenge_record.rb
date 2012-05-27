require 'util/constant'

class ReferralChallengeRecord
  include DataMapper::Resource

  property :id, Serial
  property :referrer_id, Integer, :required => true, :default => 0
  property :referral_id, Integer, :required => true, :default => 0
  property :points, Integer, :required => true, :default => 0
  property :referral_points, Integer, :required => true, :default => 0
  property :status, Enum[:pending, :complete], :default => :pending
  property :created_ts, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :referrer_id, :referral_id, :points, :referral_points, :created_ts, :update_ts
end