require 'util/constant'

class Customer
  include DataMapper::Resource

  property :id, Serial
  property :auth_code, String, :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :points, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :auth_code, :qr_code
  
  has 1, :last_check_in, 'CheckIn'
  belongs_to :merchant, :key => true
  belongs_to :user, :key => true
  
  def self.create(merchant, user)
    auth_code = String.random_alphanumeric
    filename = generate_qr_code(merchant.id, auth_code)
    customer = Customer.new(
      :auth_code => auth_code,
      :qr_code => filename
    )
    customer[:created_ts] = now
    customer[:update_ts] = now
    customer.merchant = merchant
    customer.user = user
    customer.save
    return customer
  end
  
  def self.find(user_id, start, max)
    count = Customer.count(Customer.user.id => user_id) || 0
    customers = Customer.all(Customer.user.id => user_id, :order => [ :created_ts.desc ], :offset => start, :limit => max)
    result = {}
    result[:total] = count
    result[:items] = customers
    return result 
  end
  
  def update_qr_code
    now = Time.now
    auth_code = String.random_alphanumeric
    filename = generate_qr_code(self.merchant.id, auth_code)
    self.auth_code = auth_code
    self.qr_code = filename
    self.update_ts = now
    save  
  end
  
  def as_json(options)
    only = {:only => [:points], :methods => [:last_check_in, :merchant] }
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def generate_qr_code(merchant_id, auth_code)
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