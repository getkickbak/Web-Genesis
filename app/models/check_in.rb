require 'util/constant'

class CheckIn
  include DataMapper::Resource
  
  property :id, Serial
  property :time, DateTime, :required => true, :default => ::Constant::MIN_TIME
  
  attr_accessible :time
  
  belongs_to :user
  belongs_to :venue
  
  def self.create(venue, user)
    now = Time.now
    checkin = new CheckIn(
      :time => now
    )
    checkin.user = user
    checkin.venue = venue
    checkin.save
    return checkin
  end
  
  def as_json(options)
    only = {:only => [:time]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
end