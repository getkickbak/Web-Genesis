require 'util/constant'

class CheckIn
  include DataMapper::Resource
  
  property :id, Serial
  property :time, DateTime, :required => true, :default => ::Constant::MIN_TIME
  
  attr_accessible :time
  
  belongs_to :user
  belongs_to :venue
  belongs_to :customer
  
  def self.create(venue, user, customer)
    now = Time.now
    checkin = CheckIn.new(
      :time => now
    )
    checkin.user = user
    checkin.venue = venue
    checkin.customer = customer
    checkin.save
    return checkin
  end
end