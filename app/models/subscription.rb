require 'util/constant'

class Subscription
  include DataMapper::Resource
  
  property :id, Serial
  property :email_notif, Boolean, :default => true 
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :email_notif
  
  belongs_to :user
  
  def create
    now = Time.now
    subscription = Subscription.new
    subscription[:created_ts] = now
    subscription[:update_ts] = now
    subscription.save
    return subscription
  end  
end