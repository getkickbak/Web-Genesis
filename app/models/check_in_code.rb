require 'util/constant'

class CheckInCode
  include DataMapper::Resource
  
  @@template = ERB.new File.read(File.expand_path "app/views/business/venues/check_in_template.html.erb")
  
  property :id, Serial
  property :auth_code, String, :unique_index => true, :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :qr_code_img, String, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :venue
  
  def update_qr_code
    now = Time.now
    new_auth_code = "#{self.venue.merchant.merchant_id}-#{rand(1000)}"
    new_qr_code = self.class.generate_qr_code(self.venue.merchant.merchant_id, new_auth_code) 
    self.auth_code = new_auth_code
    self.qr_code = new_qr_code
    new_qr_code_image = generate_qr_code_image(self.venue.merchant.merchant_id)
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
  
  private
  
  def self.generate_qr_code(merchant_id, code)
    qr = RQRCode::QRCode.new( code, :size => 4, :level => :h )
    png = qr.to_img.resize(85,85) 
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