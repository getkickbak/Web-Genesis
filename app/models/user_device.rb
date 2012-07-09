require 'util/constant'

class UserDevice
  include DataMapper::Resource
  
  Types = [:ios, :android, :blackberry]
  PushwooshType_to_type = { "1" => :iphone, "2" => :blackberry, "3" => :android }
  
  property :id, Serial
  property :device_id, String, :required => true, :default => ""
  property :device_type, Enum[:ios, :android, :blackberry], :required => true, :default => :ios
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :device_id, :device_type
   
  belongs_to :user
  
  def self.create(user, device_info)
    now = Time.now
    count = UserDevice.count(UserDevice.user.id => user.id)
    device = UserDevice.new(
      :device_id => device_info[:device_id],
      :device_type => PushwooshType_to_type[device_info[:device_type].to_s]
    )
    device[:created_ts] = now
    device[:update_ts] = now
    device.user = user
    device.save
    return device
  end
end