require 'util/constant'

class Device
  include DataMapper::Resource
  
  Statuses = [:activated, :deactivated]
  
  property :id, Serial
  property :serial_num, String, :required => true, :default => ""
  property :status, Enum[:activated, :deactivated], :required => true, :default => :activated
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :serial_num, :status
   
  belongs_to :merchant
  belongs_to :venue
  
  def self.create(merchant, venue, device_info)
    now = Time.now
    device = Device.new(
      :serial_num => device_info[:serial_num].strip,
      :status => device_info[:status]
    )
    device[:created_ts] = now
    device[:update_ts] = now
    device.merchant = merchant
    device.venue = venue
    device.save
    return device
  end
  
  def update(device_info)
    now = Time.now
    self.serial_num = device_info[:serial_num]
    self.status = device_info[:status]
    self.update_ts = now
    save
  end
end