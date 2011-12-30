require 'util/constant'

class Venue
  include DataMapper::Resource

  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :address1, String, :required => true, :default => ""
  property :address2, String, :default => ""
  property :city, String, :required => true, :default => ""
  property :state, String, :required => true, :default => ""
  property :zipcode, String, :required => true, :default => ""
  property :country, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :required => true, :default => ""
  property :longitude, Decimal, :scale => 6, :default => 0
  property :latitude, Decimal, :scale => 6, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :name, :address1, :address2, :city, :state, :zipcode, :country, :phone, :website, :latitude, :longitude
  
  belongs_to :merchant
  
  def self.create(merchant, venue_info)
    now = Time.now
    venue = Venue.new(
      :name => venue_info[:name],
      :address1 => venue_info[:address1],
      :city => venue_info[:city],
      :state => venue_info[:state],
      :zipcode => venue_info[:zipcode],
      :country => venue_info[:country],
      :phone => venue_info[:phone],
      :website => venue_info[:website],
      :longitude => venue_info[:longitude],
      :latitude => venue_info[:latitude]
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
       ORDER BY SQRT (((longitude-?)*(longitude-?))+((latitude-?)*(latitude-?)))  
       ASC LIMIT 0,?", longitude, longitude, latitude, latitude, max 
    ) 
    Venue.all(:id => venues_ids)
  end
  
  def update(venue_info)
    now = Time.now
    self.name = venue_info[:name]
    self.address1 = venue_info[:address1]
    self.address2 = venue_info[:address2]
    self.city = venue_info[:city]
    self.state = venue_info[:state]
    self.zipcode = venu_info[:zipcode]
    self.country = venue_info[:country]
    self.phone = venue_info[:phone]
    self.website = venue_info[:website]
    self.latitude = venue_info[:latitude]
    self.longitude = venue_info[:longitude]
    self.update_ts = now
    save
  end
end