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
    
  has 1, :last_check_in, 'CheckIn'
  belongs_to :merchant, :key => true
  belongs_to :user, :key => true
  
  def self.create(merchant, user)
    now = Time.now
    auth_code = String.random_alphanumeric
    customer = Customer.new
    customer[:auth_code] = auth_code
    customer[:qr_code] = generate_qr_code(merchant.id, auth_code)
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
    new_auth_code = String.random_alphanumeric
    self.auth_code = new_auth_code
    self.qr_code = self.class.generate_qr_code(self.merchant.id, new_auth_code)
    self.update_ts = now
    save  
  end
  
  def as_json(options)
    only = {:only => [:points], :include => [:last_check_in, :merchant] }
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def self.generate_qr_code(merchant_id, auth_code)
    qr = RQRCode::QRCode.new( auth_code, :size => 4, :level => :h )
    png = qr.to_img.resize(200,200)
    filename = "#{auth_code}.png"
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