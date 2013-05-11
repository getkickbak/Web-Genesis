require 'util/constant'

class FacebookShareSettings
  include DataMapper::Resource
  
  property :id, Serial
  property :checkins, Boolean, :default => true 
  property :badge_promotions, Boolean, :default => true
  property :rewards, Boolean, :default => true
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :checkins, :badge_promotions, :rewards
  
  belongs_to :user
  
  def self.create(user)
    now = Time.now
    facebook_share_settings = FacebookShareSettings.new
    facebook_share_settings[:created_ts] = now
    facebook_share_settings[:update_ts] = now
    facebook_share_settings.user = user
    facebook_share_settings.save
    return facebook_share_settings
  end  
end