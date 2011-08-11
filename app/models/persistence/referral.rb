require 'util/constant'

class Referral
  include DataMapper::Resource

  property :id, Serial
  property :referral_num, String, :index => true, :default => ""
  property :photo_url, String, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :photo_url

  belongs_to :creator, 'User'
  belongs_to :deal
end