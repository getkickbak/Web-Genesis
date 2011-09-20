require 'digest'
require 'util/constant'

class Merchant
  include DataMapper::Resource

  property :id, Serial
  property :merchant_id, String, :unique_index => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :email, String, :required => true, :unique => true,
            :format => :email_address
  property :first_name, String, :required => true, :default => ""
  property :last_name, String, :required => true, :default => ""
  property :encrypted_password, String, :default => ""
  property :salt, String, :default => ""
  property :address1, String, :required => true, :default => ""
  property :address2, String, :default => ""
  property :city, String, :required => true, :default => ""
  property :state, String, :required => true, :default => ""
  property :zipcode, String, :required => true, :default => ""
  property :country, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :required => true, :default => ""
  property :paypal_account, String, :required => true
  property :latitude, Decimal, :scale => 6, :default => 0
  property :longtitude, Decimal, :scale => 6, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :password, :password_confirmation
  attr_accessible :name, :email, :first_name, :last_name, :password, :password_confirmation, :address1, :address2,
                  :city, :state, :zipcode, :country, :phone, :website, :paypal_account

  has n, :deals

  validates_confirmation_of :password

  before :save, :encrypt_password
  
  def self.create(merchant_info)
    now = Time.now
    merchant_name = merchant_info[:name].squeeze(' ').strip
    merchant = Merchant.new(
    :name => merchant_name,
    :email => merchant_info[:email].strip,
    :first_name => merchant_info[:first_name].strip,
    :last_name => merchant_info[:last_name].strip,
    :password => merchant_info[:password].strip,
    :password_confirmation => merchant_info[:password_confirmation].strip,
    :address1 => merchant_info[:address1].strip,
    :address2 => merchant_info[:address2].strip,
    :city => merchant_info[:city].strip,
    :state => merchant_info[:state].strip,
    :zipcode => merchant_info[:zipcode].strip,
    :country => merchant_info[:country].strip,
    :phone => merchant_info[:phone].strip,
    :website => merchant_info[:website].strip,
    :paypal_account => merchant_info[:paypal_account].strip
    )
    merchant[:merchant_id] = merchant_name.downcase.gsub(' ','-')
    merchant[:created_ts] = now
    merchant[:update_ts] = now
    merchant.save
    return merchant
  end

  def self.find(start, max)
    count = Merchant.count
    merchants = Merchant.all(:offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = orders
    #return result
    return merchants
  end

  def self.authenticate(email, submitted_password)
    merchant = Merchant.first(:email => email)
    merchant && merchant.has_password?(submitted_password) ? merchant : nil
  end
  
  def self.authenticate_with_salt(id, cookie_salt)
    merchant = get(id)
    (merchant && merchant.salt == cookie_salt) ? merchant : nil
  end

  def to_param
    self.merchant_id
  end

  def update(merchant_info)
    now = Time.now
    self.attributes = merchant_info
    merchant_name = merchant_info[:name].squeeze(' ').strip
    self.merchant_id = merchant_name.downcase.gsub(' ','-')
    self.name = merchant_name
    self.email = merchant_info[:email].strip
    self.password = merchant_info[:password].strip
    self.password_confirmation = merchant_info[:password_confirmation].strip
    self.first_name = merchant_info[:first_name].strip
    self.last_name = merchant_info[:last_name].strip
    self.address1 = merchant_info[:address1].strip
    self.address2 = merchant_info[:address2].strip
    self.city = merchant_info[:city].strip
    self.state = merchant_info[:state].strip
    self.zipcode = merchant_info[:zipcode].strip
    self.country = merchant_info[:country].strip
    self.phone = merchant_info[:phone].strip
    self.website = merchant_info[:website].strip
    self.paypal_account = merchant_info[:paypal_account].strip
    self.update_ts = now
    save
  end

  def has_password?(submitted_password)
    self.encrypted_password == encrypt(submitted_password)  
  end
  
  private

  def encrypt_password
    self.salt = make_salt unless has_password?(self.password)
    self.encrypted_password = encrypt(self.password)
  end
  
  def encrypt(string)
     secure_hash("#{self.salt}--#{string}")
  end
  
  def make_salt
    secure_hash("#{Time.now.utc}--#{self.password}")
  end

  def secure_hash(string)
    Digest::SHA2.hexdigest(string)
  end

end
