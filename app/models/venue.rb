require 'util/constant'

class Venue
  include DataMapper::Resource

  @@template = ERB.new File.read(File.expand_path "app/views/business/venues/qrcode_template.html.erb")

  property :id, Serial
  property :name, String, :length => 16, :required => true, :default => ""
  property :address, String, :required => true, :default => ""
  property :city, String, :required => true, :default => ""
  property :state, String, :required => true, :default => ""
  property :zipcode, String, :required => true, :default => ""
  property :country, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :required => true, :default => ""
  # Disable auto-validation http://j.mp/gMORhy 
  property :photo, String, :auto_validation => false
  property :latitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :longitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :auth_code, String, :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :qr_code_img, String, :default => ""
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
  has n, :challenge_venues, :constraint => :destroy
  has n, :purchase_reward_venues, :constraint => :destroy
  has n, :customer_reward_venues, :constraint => :destroy
  has n, :challenges, :through => :challenge_venues
  has n, :purchase_rewards, :through => :purchase_reward_venues
  has n, :customer_rewards, :through => :customer_reward_venues
  
  validates_presence_of :type_id, :on => :save

  def self.create(merchant, type, venue_info)
    now = Time.now
    auth_code = String.random_alphanumeric
    qr_code = generate_qr_code(merchant.merchant_id, auth_code)
    
    venue = Venue.new(
      :type_id => type ? type.id : nil,
      :name => venue_info[:name],
      :address => venue_info[:address],
      :city => venue_info[:city],
      :state => venue_info[:state],
      :zipcode => venue_info[:zipcode],
      :country => venue_info[:country],
      :phone => venue_info[:phone],
      :website => venue_info[:website],
      :latitude => venue_info[:latitude].to_f,
      :longitude => venue_info[:longitude].to_f
    )
    venue[:auth_code] = auth_code
    venue[:qr_code] = qr_code
    venue[:created_ts] = now
    venue[:update_ts] = now
    venue.type = type
    venue.merchant = merchant
    venue.save
    qr_code_image = venue.generate_qr_code_image(merchant.merchant_id)
    venue[:qr_code_img] = qr_code_image
    
    merchant.venues.reload
    check_in_auth_code = "#{merchant.merchant_id}-#{merchant.venues.length}" 
    venue.check_in_code = CheckInCode.new(
      :auth_code => check_in_auth_code,
      :qr_code => CheckInCode.generate_qr_code(merchant.merchant_id, check_in_auth_code)
    )
    venue.check_in_code[:qr_code_img] = venue.check_in_code.generate_qr_code_image(merchant.merchant_id)
    venue.check_in_code[:created_ts] = now
    venue.check_in_code[:update_ts] = now
    venue.save
    return venue
  end
  
  def self.find_nearest(merchant_id, latitude, longitude, max)
    if merchant_id.nil?
      venues_info = DataMapper.repository(:default).adapter.select(
        "SELECT id, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
        FROM venues WHERE deleted_ts IS NULL
        ORDER BY distance
        ASC LIMIT 0,?", latitude, longitude, latitude, max 
      )
    else
      venues_info = DataMapper.repository(:default).adapter.select(
        "SELECT id, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
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
    
    # Note: Venues are not ordered by distance. Should we do it on the client side or server side?
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
  
  def update_qr_code
    now = Time.now
    new_auth_code = String.random_alphanumeric
    new_qr_code = self.class.generate_qr_code(self.merchant.merchant_id, new_auth_code) 
    self.type_id = self.type ? self.type.id : nil
    self.auth_code = new_auth_code
    self.qr_code = new_qr_code  
    new_qr_code_image = generate_qr_code_image(self.merchant.merchant_id)
    self.qr_code_img = new_qr_code_image
    self.update_ts = now
    save
  end
  
  def generate_qr_code_image(merchant_id)
    html = @@template.result(binding)

    # I am nil'ing these options out because my version of wkhtmltoimage does
    # not support the scale options and I do not want to crop the image at all.
    snap = WebSnap::Snapper.new(html, :format => 'png',
      :'crop-h' => nil, :'crop-w' => nil, :quality => 30, :'crop-x' => nil, :'crop-y' => nil)
 
    filename = "#{String.random_alphanumeric(32)}"
    AWS::S3::S3Object.store(
      ::Common.generate_merchant_qr_code_image_file_path(merchant_id,filename), 
      snap.to_bytes,
      APP_PROP["AMAZON_FILES_BUCKET"], 
      :content_type => 'image/png', 
      :access => :public_read
    )
    return filename
  end
  
  def as_json(options)
    only = {:only => [:id, :name, :longitude, :latitude, :distance], :methods => [:type, :merchant]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def self.generate_qr_code(merchant_id, code)
    qr = RQRCode::QRCode.new( code, :size => 4, :level => :h )
    png = qr.to_img.resize(225,225) 
    filename = "#{code}.png"
    AWS::S3::S3Object.store(
      ::Common.generate_merchant_qr_code_file_path(merchant_id,filename), 
      png.to_string,
      APP_PROP["AMAZON_FILES_BUCKET"], 
      :content_type => 'image/png', 
      :access => :public_read
    )
    return filename 
  end
end