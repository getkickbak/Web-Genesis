require 'util/constant'

class CheckIn
  include DataMapper::Resource
  
  property :id, Serial
  property :time, DateTime, :required => true, :default => ::Constant::MIN_TIME
  
  attr_accessible :time
  
  belongs_to :user
  belongs_to :merchant
  
  def self.create(merchant, user)
    now = Time.now
    checkin = new CheckIn(
      :time => now
    )
    checkin.user = user
    checkin.merchant = merchant
    checkin.save
    return checkin
  end
end