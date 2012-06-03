require 'util/constant'

class Merchant
  include DataMapper::Resource
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, #:registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, :timeoutable,
          :validatable, :token_authenticatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :name, String, :length => 24, :required => true, :default => ""
  property :description, String, :length => 512, :required => true, :default => ""
  property :email, String, :unique_index => true, :required => true, 
            :format => :email_address, :default => ""
  # Disable auto-validation http://j.mp/gMORhy 
  property :photo, String, :auto_validation => false
  property :alt_photo, String, :auto_validation => false           
  property :account_first_name, String, :required => true, :default => ""
  property :account_last_name, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :default => "", :format => :url 
  property :payment_account_id, String, :default => ""
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :pending
  property :prize_terms, String, :required => true, :default => ""
  property :auth_code, String, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id, :current_password, :eager_load_type
  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h

  attr_accessible :type_id, :name, :description, :email, :account_first_name, :account_last_name, :phone, :website, :photo, :alt_photo, :status, :prize_terms, :auth_code, :current_password, :password, :password_confirmation
  
  has 1, :merchant_to_type, :constraint => :destroy
  has 1, :type, 'MerchantType', :through => :merchant_to_type, :via => :merchant_type
  has 1, :reward_model, :constraint => :destroy
  has n, :merchant_credit_cards, :child_key => [ :merchant_id ], :constraint => :destroy
  has n, :credit_cards, :through => :merchant_credit_cards, :via => :credit_card
  has n, :venues, :constraint => :destroy
  mount_uploader :photo, MerchantPhotoUploader
  mount_uploader :alt_photo, MerchantPhotoUploader

  before_save :ensure_authentication_token
  
  validates_with_method :type_id, :method => :check_type_id

  def self.get_cache_key(id)
    "Merchant-#{id}"  
  end
  
  def self.create(type, merchant_info)
    now = Time.now
    merchant_name = merchant_info[:name].squeeze(' ').strip
    password = merchant_info[:password] ? merchant_info[:password].strip : merchant_info.password
    password_confirmation  = merchant_info[:password_confirmation] ? merchant_info[:password_confirmation].strip : merchant_info.password_confirmation
    merchant = Merchant.new(
      :type_id => type ? type.id : nil,
      :name => merchant_name,
      :description => merchant_info[:description].strip,
      :email => merchant_info[:email].strip,
      :current_password => password,
      :password => password,
      :password_confirmation => password_confirmation,
      :account_first_name => merchant_info[:account_first_name].strip,
      :account_last_name => merchant_info[:account_last_name].strip,
      :phone => merchant_info[:phone].strip,
      :website => merchant_info[:website].strip,
      :status => merchant_info[:status],
      :prize_terms => merchant_info[:prize_terms],
      :auth_code => String.random_alphanumeric(32)
    )
    merchant[:created_ts] = now
    merchant[:update_ts] = now
    merchant.type = type
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
  
  def cache_key
    "Merchant-#{self.id}"    
  end
  
  def to_param
   self.id
  end

  def password_required?
    !self.current_password.nil? 
  end
  
  # Override Devise::mailer
  def devise_mailer
    Business::MerchantDevise::Mailer
  end
  
  # Override Devise::Models::Recoverable
  #
  # Update password saving the record and clearing token. Returns true if
  # the passwords are valid and the record was saved, false otherwise.
  def reset_password!(new_password, new_password_confirmation)
    self.type_id = self.type.id
    self.password = new_password
    self.password_confirmation = new_password_confirmation
    clear_reset_password_token if valid?
    save
  end
      
  def update_all(type, merchant_info)
    now = Time.now
    self.type_id = type ? type.id : nil
    merchant_name = merchant_info[:name].squeeze(' ').strip
    self.name = merchant_name
    self.description = merchant_info[:description].strip
    self.email = merchant_info[:email].strip
    if !merchant_info[:current_password].empty?
      self.current_password = merchant_info[:current_password].strip
      if self.current_password && !valid_password?(self.current_password)
        errors.add(:current_password, I18n.t("errors.messages.merchant.incorrect_password"))
        raise DataMapper::SaveFailureError.new("", self)
      end
      if self.current_password == merchant_info[:password].strip
        errors.add(:password, I18n.t("errors.messages.merchant.reuse_password"))
        raise DataMapper::SaveFailureError.new("", self)
      end
      self.password = merchant_info[:password].strip
      self.password_confirmation = merchant_info[:password_confirmation].strip 
    else
      self.current_password = nil  
    end
    self.account_first_name = merchant_info[:account_first_name].strip
    self.account_last_name = merchant_info[:account_last_name].strip
    self.phone = merchant_info[:phone].strip
    self.website = merchant_info[:website].strip
    self.status = merchant_info[:status]
    self.update_ts = now
    self.type = type
    save
  end
    
  def update_photo(merchant_info)
    if merchant_info.nil?
      errors.add(:photo, I18n.t("errors.messages.merchant.no_photo"))
      raise DataMapper::SaveFailureError.new("", self)
    end
    now = Time.now
    self.type_id = self.type.id
    self.current_password = nil
    self.photo = merchant_info[:photo]
    self.update_ts = now  
    save
  end
    
  def update_alt_photo(merchant_info)
    if merchant_info.nil?
      errors.add(:alt_photo, I18n.t("errors.messages.merchant.no_photo"))
      raise DataMapper::SaveFailureError.new("", self)
    end
    now = Time.now
    self.type_id = self.type.id
    self.current_password = nil
    self.alt_photo = merchant_info[:alt_photo]
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
  
  private
  
   def check_type_id
    if self.type && self.type.id
      return true  
    end
    return [false, ValidationErrors.default_error_message(:blank, :type_id)]
  end
end
