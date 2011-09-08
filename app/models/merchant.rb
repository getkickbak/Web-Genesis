require 'util/constant'

class Merchant
  include DataMapper::Resource

  property :id, Serial
  property :merchant_id, String, :unique_index => true, :default => ""
  property :name, String, :required => true
  property :email, String, :required => true, :unique => true,
            :format => :email_address
  property :salt, String, :default => ""
  property :address, String, :required => true
  property :phone, String, :required => true
  property :paypal_account, String, :required => true
  property :latitude, Decimal, :scale => 6, :default => 0
  property :longtitude, Decimal, :scale => 6, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :name, :email, :address, :phone, :paypal_account

  has n, :deals
  
  def self.create(merchant_info)
    now = Time.now
    merchant_name = merchant_info[:name].squeeze(' ').strip
    merchant = Merchant.new(
      :name => merchant_name,
      :email => merchant_info[:email].strip,
      :address => merchant_info[:address].strip,
      :phone => merchant_info[:phone].strip,
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
  
  def self.authenticate_with_salt(id, cookie_salt)
    merchant = get(id)
    (merchant && merchant.salt == cookie_salt) ? merchant : nil
  end
  
  def self.const_missing(const)
    puts "#{const} is called"
  end
  
  def to_param
    self.merchant_id
  end
  
  def update(merchant_info)
    now = Time.now
    self.attributes = merchant_info
    merchant_name = merchant_info[:name].squeeze(' ').strip
    self.name = merchant_name
    self.email = merchant_info[:email].strip
    self.merchant_id = merchant_name.downcase.gsub(' ','-') 
    self.paypal_account = merchant_info[:paypal_account].strip
    self.update_ts = now
    save   
  end
end
