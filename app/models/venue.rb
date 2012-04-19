require 'util/constant'

class Venue
  include DataMapper::Resource

  property :id, Serial
  property :name, String, :length => 24, :required => true, :default => ""
  property :address, String, :required => true, :default => ""
  property :city, String, :required => true, :default => ""
  property :state, String, :required => true, :default => ""
  property :zipcode, String, :required => true, :default => ""
  property :country, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :required => true, :default => "", :format => :url 
  # Disable auto-validation http://j.mp/gMORhy 
  property :photo, String, :auto_validation => false
  property :latitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :longitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :type_id, :distance
  
  attr_accessible :type_id, :name, :address, :city, :state, :zipcode, :country, :phone, :website, :latitude, :longitude
  
  belongs_to :merchant
  has 1, :venue_to_type, :constraint => :destroy
  has 1, :type, 'VenueType', :through => :venue_to_type, :via => :venue_type
  has 1, :check_in_code, :constraint => :destroy
  has n, :authorization_codes, :constraint => :destroy
  has n, :challenge_venues, :constraint => :destroy
  has n, :purchase_reward_venues, :constraint => :destroy
  has n, :customer_reward_venues, :constraint => :destroy
  has n, :challenges, :through => :challenge_venues
  has n, :purchase_rewards, :through => :purchase_reward_venues
  has n, :customer_rewards, :through => :customer_reward_venues
  
  validates_with_method :type_id, :method => :check_type_id

  def self.create(merchant, type, venue_info)
    now = Time.now
    
    venue = Venue.new(
      :type_id => type ? type.id : nil,
      :name => venue_info[:name].strip,
      :address => venue_info[:address].strip,
      :city => venue_info[:city].strip,
      :state => venue_info[:state].strip,
      :zipcode => venue_info[:zipcode].strip,
      :country => venue_info[:country],
      :phone => venue_info[:phone].strip,
      :website => venue_info[:website].strip,
      :latitude => venue_info[:latitude].to_f,
      :longitude => venue_info[:longitude].to_f
    )
    venue[:created_ts] = now
    venue[:update_ts] = now
    venue.type = type
    venue.merchant = merchant
    venue.save
    
    auth_code = String.random_alphanumeric
    authorization_code = venue.authorization_codes.new
    authorization_code[:auth_code] = auth_code
    authorization_code[:qr_code] = AuthorizationCode.generate_qr_code(merchant.id, auth_code)
    authorization_code[:qr_code_img] = authorization_code.generate_qr_code_image(merchant.id)
    authorization_code[:created_ts] = now
    authorization_code[:update_ts] = now
    
    merchant.venues.reload
    check_in_auth_code = "#{merchant.id}-#{merchant.venues.length}" 
    venue.check_in_code = CheckInCode.new
    venue.check_in_code[:auth_code] = check_in_auth_code
    venue.check_in_code[:qr_code] = CheckInCode.generate_qr_code(merchant.id, check_in_auth_code)
    venue.check_in_code[:qr_code_img] = venue.check_in_code.generate_qr_code_image(merchant.id)
    venue.check_in_code[:created_ts] = now
    venue.check_in_code[:update_ts] = now
    venue.save
    return venue
  end
  
  def self.find_nearest(merchant_id, latitude, longitude, max)
    if Rails.env == 'production'
      if merchant_id.nil?
        venues_info = DataMapper.repository(:default).adapter.select(
          "SELECT id, round( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ), 1) AS distance
          FROM venues WHERE deleted_ts IS NULL
          ORDER BY distance
          ASC LIMIT 0,?", latitude, longitude, latitude, max 
        )
      else
        venues_info = DataMapper.repository(:default).adapter.select(
          "SELECT id, round( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ), 1) AS distance
          FROM venues WHERE merchant_id = ? AND deleted_ts IS NULL
          ORDER BY distance
          ASC LIMIT 0,?", latitude, longitude, latitude, merchant_id, max 
        )
      end   
      venue_id_to_distance_map = {}
      venue_ids = []
      venues_info.each do |key,value|
        venue_ids << value[:id] 
        venue_id_to_distance_map[value[:id]] = value[:distance]
      end
      venues = Venue.all(:id => venue_ids)
      venues.each do |venue|
        venue.distance = venue_id_to_distance_map[venue.id]
      end
    else
      if merchant_id.nil?
        venues = Venue.all(:offset => 0, :limit => max)
      else
        venues = Venue.all(Venue.merchant.id => merchant_id, :offset => 0, :limit => max)
      end    
      venues.each do |venue|
        venue.distance = (rand * 10).round(1)
      end  
    end
    return venues
  end
  
  def display_name
    "#{self.name} - #{self.address}"  
  end
  
  def update(type, venue_info)
    now = Time.now
    self.type_id = type ? type.id : nil
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
    self.type = type
    save
  end
  
  private
  
  def check_type_id
    if self.type && self.type.id
      return true  
    end
    return [false, ValidationErrors.default_error_message(:blank, :type_id)]
  end
end