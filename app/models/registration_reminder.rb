require 'util/constant'

class RegistrationReminder
  include DataMapper::Resource
  
  property :user_id, Integer, :key => true
  property :count, Integer, :key => true, :default => 0
  property :delivered, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :user_id, :count
  
  def self.create(registration_reminder_info)
    now = Time.now
    reminder = RegistrationReminder.new(
      :user_id => registration_reminder_info[:user_id],
      :count => registration_reminder_info[:count]
    )
    reminder[:created_ts] = now
    reminder[:update_ts] = now
    reminder.save
    return reminder
  end
end