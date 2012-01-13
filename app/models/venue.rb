require 'util/constant'

class Venue
  include DataMapper::Resource

  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :address, String, :required => true, :default => ""
  property :city, String, :required => true, :default => ""
  property :state, String, :required => true, :default => ""
  property :zipcode, String, :required => true, :default => ""
  property :country, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :required => true, :default => ""
  property :longitude, Decimal, :precision => 20, :scale => 15, :default => 0
  property :latitude, Decimal, :precision => 20, :scale => 15, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :name, :address, :city, :state, :zipcode, :country, :phone, :website, :latitude, :longitude
  
  belongs_to :merchant
  has n, :challenge_venues
  has n, :purchase_reward_venues
  has n, :customer_reward_venues
  has n, :challenges, :through => :challenge_venues
  has n, :purchase_rewards, :through => :purchase_reward_venues
  has n, :customer_rewards, :through => :customer_reward_venues
  
  def self.create(merchant, venue_info)
    now = Time.now
    venue = Venue.new(
      :name => venue_info[:name],
      :address => venue_info[:address],
      :city => venue_info[:city],
      :state => venue_info[:state],
      :zipcode => venue_info[:zipcode],
      :country => venue_info[:country],
      :phone => venue_info[:phone],
      :website => venue_info[:website],
      :longitude => venue_info[:longitude].to_f,
      :latitude => venue_info[:latitude].to_f
    )
    venue[:created_ts] = now
    venue[:update_ts] = now
    venue.merchant = merchant
    venue.save
    return venue
  end
  
  def self.find_nearest(longitude, latitude, max)
    venues_ids = DataMapper.repository(:default).adapter.select(
      "SELECT id FROM venues WHERE deleted_ts IS NULL
       ORDER BY ( 3959 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) )  
       ASC LIMIT 0,?", latitude, longitude, latitude, max 
    ) 
    Venue.all(:id => venues_ids)
  end
  
  def update(venue_info)
    now = Time.now
    self.name = venue_info[:name]
    self.address = venue_info[:address]
    self.city = venue_info[:city]
    self.state = venue_info[:state]
    self.zipcode = venue_info[:zipcode]
    self.country = venue_info[:country]
    self.phone = venue_info[:phone]
    self.website = venue_info[:website]
    self.longitude = venue_info[:longitude].to_f
    self.latitude = venue_info[:latitude].to_f
    self.update_ts = now
    save
  end
end