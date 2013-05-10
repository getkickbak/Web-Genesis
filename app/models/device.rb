require 'util/constant'

class Device
  include DataMapper::Resource
  
  Type = [:wifi, :internet]
  Statuses = [:ready, :activated, :in_repair, :deactivated]
  
  property :id, Serial
  property :type, Enum[:wifi, :internet], :required => true, :default => :wifi
  property :device_id, String, :required => true, :default => ""
  property :status, Enum[:ready, :activated, :in_repair, :deactivated], :required => true, :default => :ready
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :venue_id
  attr_accessible :venue_id, :type, :device_id, :status
   
  belongs_to :merchant
  belongs_to :merchant_venue, 'Venue'
  
  validates_with_method :venue_id, :method => :check_venue_id
  
  def self.create(merchant, venue, device_info)
    now = Time.now
    status = device_info[:status]
    device_id = device_info[:device_id]
    device = Device.new(
      :venue_id => venue ? venue.id : nil,
      :type => device_info[:type],
      :device_id => device_info[:device_id].strip,
      :status => device_info[:status]
    )
    device[:created_ts] = now
    device[:update_ts] = now
    device.merchant = merchant
    device.merchant_venue = venue
    device.save
    return device
  end
  
  def update_all(venue, device_info)
    now = Time.now
    self.venue_id = venue ? venue.id : nil
    self.type = device_info[:type]
    self.device_id = device_info[:device_id].strip
    self.status = device_info[:status]
    self.update_ts = now
    self.merchant_venue = venue
    save
  end
  
  private
  
  def check_venue_id
    if self.merchant_venue
      return true  
    end
    return [false, ValidationErrors.default_error_message(:blank, :venue_id)]
  end
end