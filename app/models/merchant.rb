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
  property :photo_url, String, :default => ""
  property :account_first_name, String, :required => true, :default => ""
  property :account_last_name, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :payment_account_id, String, :default => ""
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :pending
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id, :current_password

  attr_accessible :type_id, :name, :email, :account_first_name, :account_last_name, :phone, :status, :password, :password_confirmation
  
  has 1, :merchant_to_type, :constraint => :destroy
  has 1, :type, 'MerchantType', :through => :merchant_to_type, :via => :merchant_type
  has 1, :reward_model, :constraint => :destroy
  has n, :merchant_credit_cards, :child_key => [ :merchant_id ], :constraint => :destroy
  has n, :credit_cards, :through => :merchant_credit_cards, :via => :credit_card
  has n, :venues, :constraint => :destroy

  validates_presence_of :type_id  

  def self.get_cache_key(id)
    "Merchant-#{id}"  
  end
  
  def self.create(type, merchant_info)
    now = Time.now
    merchant_name = merchant_info[:name].squeeze(' ').strip
    merchant_id = "#{rand(1000) + 3000}#{now.to_i}"
    
    merchant = Merchant.new(
      :type_id => type ? type.id : nil,
      :name => merchant_name,
      :email => merchant_info[:email].strip,
      :current_password => merchant_info[:password].strip,
      :password => merchant_info[:password].strip,
      :password_confirmation => merchant_info[:password_confirmation].strip,
      :account_first_name => merchant_info[:account_first_name].strip,
      :account_last_name => merchant_info[:account_last_name].strip,
      :phone => merchant_info[:phone].strip,
      :status => merchant_info[:status]
    )
    merchant[:merchant_id] = merchant_id
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
   self.merchant_id
  end

  def password_required?
    !self.current_password.nil? 
  end
  
  # Override Devise::mailer
  def devise_mailer
    "Business::MerchantDevise::Mailer"
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
    self.email = merchant_info[:email].strip
    if !merchant_info[:current_password].empty?
      self.current_password = merchant_info[:current_password].strip
      if self.current_password && !valid_password?(self.current_password)
        errors.add(:current_password, "Incorrect password")
        raise DataMapper::SaveFailureError.new("", self)
      end
      if self.current_password == merchant_info[:password].strip
        errors.add(:password, "New password must be different from current password")
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
    self.status = merchant_info[:status]
    self.update_ts = now
    self.type = type
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
    only = {:only => [:id, :merchant_id, :name, :photo_url], :methods => [:type]}
    options = options.nil? ? only : options.merge(only)
     super(options)
  end
end
