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
  
  def self.generate_qr_code(merchant_id, code)
    filename = "#{code}.png"
    if APP_PROP["GENERATE_QRCODE"]
      qr = RQRCode::QRCode.new( code, :size => 4, :level => :h )
      png = qr.to_img.resize(85,85) 
      AWS::S3::S3Object.store(
        ::Common.generate_merchant_qr_code_file_path(merchant_id,filename), 
        png.to_string,
        APP_PROP["AMAZON_FILES_BUCKET"], 
        :content_type => 'image/png', 
        :access => :public_read
      )
    end
    return filename
  end
  
  def generate_qr_code_image(merchant_id)
    filename = "#{String.random_alphanumeric(32)}.pdf"
    if APP_PROP["GENERATE_QRCODE"]
      html = @@template.result(binding)
      kit = PDFKit.new(html, :page_size => 'Tabloid')
      AWS::S3::S3Object.store(
        ::Common.generate_merchant_qr_code_image_file_path(merchant_id,filename), 
        kit.to_pdf,
        APP_PROP["AMAZON_FILES_BUCKET"], 
        :content_type => 'application/pdf', 
        :access => :public_read
      )
    end
    return filename 
  end
end