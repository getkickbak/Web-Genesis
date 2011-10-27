require 'util/constant'

class Coupon
  include DataMapper::Resource

  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/coupon_template.html.erb")

  property :id, Serial
  property :coupon_id, String, :unique_index => true, :default => 0
  property :coupon_title, String, :default => ""
  property :barcode, String, :default => ""
  property :qr_code, String, :default => ""
  property :redeemed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :used

  belongs_to :order
  
  def to_param
    self.coupon_id
  end
  
  def print
    html = @@template.result(binding)
    kit = PDFKit.new(html, :page_size => 'Letter')
    #kit.stylesheets << '/path/to/css/file'

    # Save the PDF to a file
    kit.to_file(APP_PROP["COUPON_FILE_PATH"]+"#{self.coupon_id}.pdf")
  end
end
