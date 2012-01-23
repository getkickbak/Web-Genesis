require 'util/constant'

class Venue
  include DataMapper::Resource

  @@template = ERB.new File.read(File.expand_path "app/views/business/dashboard/qrcode_template.html.erb")

  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :address, String, :required => true, :default => ""
  property :city, String, :required => true, :default => ""
  property :state, String, :required => true, :default => ""
  property :zipcode, String, :required => true, :default => ""
  property :country, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :required => true, :default => ""
  property :longitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :latitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :auth_code, String, :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :qr_code_img, String, :default => ""
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
    auth_code = String.random_alphanumeric
    qr_code = generate_qr_code(merchant.id, auth_code)
    
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
    venue[:auth_code] = auth_code
    venue[:qr_code] = qr_code
    venue[:created_ts] = now
    venue[:update_ts] = now
    venue.merchant = merchant
    venue.save
    qr_code_image = venue.generate_qr_code_image(merchant.merchant_id)
    venue[:qr_code_img] = qr_code_image
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
  
  def update_qr_code
    now = Time.now
    auth_code = String.random_alphanumeric
    qr_code = self.class.generate_qr_code(self.merchant_id, auth_code) 
    qr_code_image = generate_qr_code_image(merchant_id)
    
    self.auth_code = auth_code
    self.qr_code = qr_code
    self.qr_code_img = qr_code_image
    self.update_ts = now
    save
  end
  
  def generate_qr_code_image(merchant_id)
    html = @@template.result(binding)

    # I am nil'ing these options out because my version of wkhtmltoimage does
    # not support the scale options and I do not want to crop the image at all.
    snap = WebSnap::Snapper.new(html, :format => 'png', :'scale-h' => nil, :'scale-w' => nil,
      :'crop-h' => nil, :'crop-w' => nil, :quality => 100, :'crop-x' => nil, :'crop-y' => nil)
 
    filename = String.random_alphanumeric(32)
    AWS::S3::S3Object.store(
      ::Common.generate_merchant_qr_code_image_file_path(merchant_id,"#{filename}"), 
      snap.to_bytes,
      APP_PROP["AMAZON_FILES_BUCKET"], 
      :content_type => 'image/png', 
      :access => :public_read
    )
    full_filename = ::Common.generate_full_merchant_qr_code_image_file_path(merchant_id,"#{filename}") 
  end
  
  def as_json(options)
    only = {:only => [:id, :name, :longitude, :latitude], :methods => [:merchant]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def self.generate_qr_code(merchant_id, auth_code)
    qr = RQRCode::QRCode.new( auth_code, :size => 5, :level => :h )
    png = qr.to_img.resize(90,90)
    AWS::S3::S3Object.store(
      ::Common.generate_merchant_qr_code_file_path(merchant_id,"#{auth_code}.png"), 
      png.to_string,
      APP_PROP["AMAZON_FILES_BUCKET"], 
      :content_type => 'image/png', 
      :access => :public_read
    )
    filename = ::Common.generate_full_merchant_qr_code_file_path(merchant_id,"#{auth_code}.png")  
  end
end