require 'util/constant'

class AuthorizationCode
  include DataMapper::Resource
  
  @@template = ERB.new File.read(File.expand_path "app/views/business/venues/qrcode_template.html.erb")
  
  property :id, Serial
  property :auth_code, String, :unique_index => true, :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :qr_code_img, String, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :venue
  
  def self.create(venue)
    now = Time.now
    auth_code = String.random_alphanumeric
    authorization_code = AuthorizationCode.new
    authorization_code.venue = venue
    authorization_code[:auth_code] = auth_code
    authorization_code[:qr_code] = generate_qr_code(venue.merchant.id, auth_code)
    authorization_code[:qr_code_img] = authorization_code.generate_qr_code_image(venue.merchant.id)
    authorization_code[:created_ts] = now
    authorization_code[:update_ts] = now  
    authorization_code.save
    return authorization_code
  end
  
  def update_qr_code
    now = Time.now
    new_auth_code = String.random_alphanumeric
    self.auth_code = new_auth_code
    self.qr_code = self.class.generate_qr_code(self.merchant.id, new_auth_code)  
    self.qr_code_img = generate_qr_code_image(self.merchant.id)
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