require 'digest'
require 'util/constant'

class Merchant
  include DataMapper::Resource
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, #:registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, :timeoutable,
          :validatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :merchant_id, String, :unique_index => true, :required => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :email, String, :required => true, :unique => true,
            :format => :email_address
  property :encrypted_password, String, :required => true, :default => ""
  property :photo_url, String, :default => ""
  property :account_first_name, String, :required => true, :default => ""
  property :account_last_name, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :auth_code, String, :required => true, :default => ""
  property :qr_code, String, :required => true, :default => ""
  property :payment_account_id, String, :default => ""
  property :status, Enum[:active, :suspended, :deleted], :default => :active
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :name, :email, :account_first_name, :account_last_name, :phone, :password, :password_confirmation, :encrypted_password

  validates_presence_of :password, :password_confirmation
  validates_length_of :password, :min => 6, :max => 40
  validates_confirmation_of :password
  
  has n, :merchant_credit_cards, :child_key => [ :merchant_id ]
  has n, :credit_cards, :through => :merchant_credit_cards, :via => :credit_card

  def self.create(merchant_info, password, password_confirmation)
    now = Time.now
    merchant_name = merchant_info[:name].squeeze(' ').strip
    merchant_id = merchant_name.downcase.gsub(' ','-')
    auth_code = String.random_alphanumeric
    filename = generate_qr_code(merchant_id, auth_code)
    
    merchant = Merchant.new(
      :name => merchant_name,
      :email => merchant_info[:email].strip,
      :password => password.strip,
      :password_confirmation => password_confirmation.strip,
      :encrypted_password => merchant_info[:encrypted_password],
      :account_first_name => merchant_info[:account_first_name].strip,
      :account_last_name => merchant_info[:account_last_name].strip,
      :phone => merchant_info[:phone].strip
    )
    merchant[:merchant_id] = merchant_id
    merchant[:auth_code] = auth_code
    merchant[:qr_code] = filename
    merchant[:created_ts] = now
    merchant[:update_ts] = now
    merchant.save
    return merchant
  end

  def self.create_without_devise(merchant_info)
    merchant_info[:encrypted_password] = self.encrypt_password(merchant_info[:password])
    self.create(merchant_info, merchant_info[:password], merchant_info[:password_confirmation])
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

  def password_required?  
    !self.password.blank? && super  
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
    self.encrypted_password = Merchant.encrypt_password(self.password)
    self.account_first_name = merchant_info[:account_first_name].strip
    self.account_last_name = merchant_info[:account_last_name].strip
    self.phone = merchant_info[:phone].strip
    self.update_ts = now
    save
  end
  
  def update_qr_code
    now = Time.now
    auth_code = String.random_alphanumeric
    filename = self.generate_qr_code(self.merchant_id, auth_code) 
    self.auth_code = auth_code
    self.qr_code = filename
    self.update_ts = now
    save
  end
  
  def add_credit_card(credit_card)
    credit_cards.concat(Array(credit_card))
    save
    self
  end
  
  def remove_credit_card(credit_card)
    merchant_credit_cards.all(:credit_card => Array(credit_card)).destroy
    reload
    self
  end
  
  def as_json(options)
    only = {:only => [:merchant_id,:name]}
    options = options.nil? ? only : options.merge(only)
     super(options)
  end
  
  private
  
  def self.encrypt_password(password)
    BCrypt::Password.create(password)
  end
  
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
