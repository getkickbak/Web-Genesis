require 'util/constant'

class Merchant
  include DataMapper::Resource

  Roles = %w[test merchant]
  Statuses = [:active, :pending, :suspended, :deleted]

  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, #:registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, :timeoutable,
          :validatable, :token_authenticatable, :authentication_keys => [:email]

  property :id, Serial
  property :name, String, :length => 24, :required => true, :default => ""
  property :description, String, :length => 512, :required => true, :default => ""
  ## Database authenticatable
  property :email, String, :unique_index => true, :required => true,
            :format => :email_address, :default => ""
  property :encrypted_password, String, :required => true, :default => ""
  ## Recoverable
  property :reset_password_token, String
  property :reset_password_sent_at, DateTime
  ## Rememberable
  property :remember_created_at, DateTime
  ## Trackable
  property :sign_in_count, Integer, :default => 0
  property :current_sign_in_at, DateTime
  property :last_sign_in_at, DateTime
  property :current_sign_in_ip, String
  property :last_sign_in_ip, String
  ## Token authenticatable
  property :authentication_token, String
  # Disable auto-validation http://j.mp/gMORhy
  property :photo, String, :auto_validation => false
  property :alt_photo, String, :auto_validation => false
  property :account_first_name, String, :required => true, :default => ""
  property :account_last_name, String, :required => true, :default => ""
  property :phone, String, :required => true, :default => ""
  property :website, String, :default => "", :format => :url
  property :payment_account_id, String, :default => ""
  property :role, String, :required => true, :default => "merchant"
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :pending
  property :will_terminate, Boolean, :required => true, :default => false
  property :termination_date, Date, :default => ::Constant::MIN_DATE
  property :custom_badges, Boolean, :required => true,  :default => false
  property :reward_terms, String, :required => true, :default => ""
  property :auth_code, String, :required => true, :default => ""
  property :badges_update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :type_id, :visit_frequency_id, :current_password, :eager_load_type, :termination_date_str
  attr_accessor :crop_x, :crop_y, :crop_w, :crop_h

  attr_accessible :type_id, :visit_frequency_id, :name, :description, :email, :account_first_name, :account_last_name, :phone, :website, :photo, :alt_photo, :role, :status, :will_terminate, :termination_date,
                  :reward_terms, :auth_code, :current_password, :password, :password_confirmation, :badges_attributes

  has 1, :merchant_to_type, :constraint => :destroy
  has 1, :type, 'MerchantType', :through => :merchant_to_type, :via => :merchant_type
  has 1, :sign_up_code, :constraint => :destroy
  has 1, :reward_model, :constraint => :destroy
  has 1, :merchant_to_visit_frequency_type, :constraint => :destroy
  has 1, :visit_frequency, 'VisitFrequencyType', :through => :merchant_to_visit_frequency_type, :via => :visit_frequency_type
  has n, :merchant_to_badge, :constraint => :destroy
  has n, :badges, :through => :merchant_to_badge, :via => :badge
  has n, :merchant_credit_cards, :child_key => [ :merchant_id ], :constraint => :destroy
  has n, :credit_cards, :through => :merchant_credit_cards, :via => :credit_card
  has n, :venues, :constraint => :destroy
  mount_uploader :photo, MerchantPhotoUploader
  mount_uploader :alt_photo, MerchantPhotoUploader

  accepts_nested_attributes_for :badges, :reject_if => lambda { |b| b[:visits].blank? }

  validates_with_method :type_id, :method => :check_type_id
  validates_with_method :visit_frequency_id, :method => :check_visit_frequency_id
  validates_with_method :termination_date, :method => :validate_termination_date
  validates_with_method :phone, :method => :validate_phone  

  before_save :ensure_authentication_token

  def self.create(type, visit_frequency, merchant_info)
    now = Time.now
    if (merchant_info.is_a? Hash) || (merchant_info.is_a? ActiveSupport::HashWithIndifferentAccess)
      merchant_name = merchant_info[:name].squeeze(' ').strip
      description = merchant_info[:description].strip
      email = merchant_info[:email].strip
      password = merchant_info[:password].strip
      password_confirmation = merchant_info[:password_confirmation].strip
      account_first_name = merchant_info[:account_first_name].strip
      account_last_name = merchant_info[:account_last_name].strip
      phone = merchant_info[:phone].strip
      website = merchant_info[:website].strip
      role = merchant_info[:role]
      status = merchant_info[:status]
      will_terminate = merchant_info[:will_terminate]
      terminate_date = merchant_info[:terminate_date]
      custom_badges = merchant_info[:custom_badges]
      reward_terms = merchant_info[:reward_terms]
    else
      merchant_name = merchant_info.name
      description = merchant_info.description
      email = merchant_info.email
      account_first_name = merchant_info.account_first_name
      account_last_name = merchant_info.account_last_name
      password = merchant_info.password
      password_confirmation = merchant_info.password_confirmation
      account_first_name = merchant_info.account_first_name
      account_last_name = merchant_info.account_last_name
      phone = merchant_info.phone
      website = merchant_info.website
      role = merchant_info.role
      status = merchant_info.status
      will_terminate = merchant_info.will_terminate
      terminate_date = merchant_info.terminate_date
      custom_badges = merchant_info.custom_badges
      reward_terms = merchant_info.reward_terms
    end
    merchant = Merchant.new(
      :type_id => type ? type.id : nil,
      :visit_frequency_id => visit_frequency ? visit_frequency.id : nil,
      :name => merchant_name,
      :description => description,
      :email => email,
      :current_password => password,
      :password => password,
      :password_confirmation => password_confirmation,
      :account_first_name => account_first_name,
      :account_last_name => account_last_name,
      :phone => phone,
      :website => website,
      :role => role,
      :status => status,
      :will_terminate => will_terminate,
      :termination_date => now.to_date,
      :custom_badges => custom_badges,
      :reward_terms => reward_terms,
      :auth_code => String.random_alphanumeric(32)
    )
    merchant.termination_date_str = will_terminate ? terminate_date : ""
    merchant[:created_ts] = now
    merchant[:update_ts] = now
    merchant.type = type
    merchant.visit_frequency = visit_frequency
    merchant.save
    return merchant
  end

=begin
  def self.cache_key(id)
    "Merchant-#{id}"    
  end
  
  def self.get(key)
    c_key = cache_key(key[0])
    Rails.cache.fetch(c_key) do
      super(key)
    end
  end
  
  def save(options=nil)
    super  
    Rails.cache.write(cache_key, self)
  end
  
  def save!
    super
    Rails.cache.write(cache_key, self)  
  end
  
  def cache_key
    "Merchant-#{self.id}"
  end
=end

  def mutex_key
    "MerchantMutex-#{self.id}"
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
    self.visit_frequency_id = self.visit_frequency.id
    self.password = new_password
    self.password_confirmation = new_password_confirmation
    clear_reset_password_token if valid?
    save
  end

  def update_all(type, visit_frequency, merchant_info)
    now = Time.now
    self.type_id = type ? type.id : nil
    self.visit_frequency_id = visit_frequency ? visit_frequency.id : nil
    merchant_name = merchant_info[:name].squeeze(' ').strip
    self.name = merchant_name
    self.description = merchant_info[:description].strip
    self.email = merchant_info[:email].strip
    if ((merchant_info.include? :current_password) && !merchant_info[:current_password].empty?) || ((merchant_info.include? :password) && !merchant_info[:password].empty?) || ((merchant_info.include? :password_confirmation) && !merchant_info[:password_confirmation].empty?)
      self.current_password = merchant_info[:current_password].strip
      if !valid_password?(self.current_password)
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
    self.role = merchant_info[:role]
    self.status = merchant_info[:status]
    self.will_terminate = merchant_info[:will_terminate]
    self.termination_date_str = merchant_info[:will_terminate] ? merchant_info[:termination_date] : ""
    self.custom_badges = merchant_info[:custom_badges]
    self.update_ts = now
    self.type = type
    self.visit_frequency = visit_frequency
    save
  end

  def update_password(merchant_info)
    now = Time.now
    self.current_password = merchant_info[:current_password].strip
    if !valid_password?(self.current_password)
      errors.add(:current_password, I18n.t("errors.messages.merchant.incorrect_password"))
      raise DataMapper::SaveFailureError.new("", self)
    end
    if self.current_password == merchant_info[:password].strip
      errors.add(:password, I18n.t("errors.messages.merchant.reuse_password"))
      raise DataMapper::SaveFailureError.new("", self)
    end
    self.password = merchant_info[:password].strip
    self.password_confirmation = merchant_info[:password_confirmation].strip 
    self.update_ts = now
    save 
  end
  
  def update_photo(merchant_info)
    if merchant_info.nil?
      errors.add(:photo, I18n.t("errors.messages.merchant.no_photo"))
      raise DataMapper::SaveFailureError.new("", self)
    end
    now = Time.now
    self.type_id = self.type.id
    self.visit_frequency_id = self.visit_frequency.id
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
    self.visit_frequency_id = self.visit_frequency.id
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

  def create_sign_up_code
    if self.sign_up_code.nil?
      now = Time.now
      sign_up_auth_code = "#{self.id}"
      data =  {
        :auth_code => sign_up_auth_code
      }.to_json
      cipher = Gibberish::AES.new(self.auth_code)
      encrypted_data = cipher.enc(data)
      self.sign_up_code = SignUpCode.new
      encrypted_code = "m#{self.id}$#{encrypted_data}"
      self.sign_up_code[:auth_code] = sign_up_auth_code
      self.sign_up_code[:qr_code] = SignUpCode.generate_qr_code(self.id, encrypted_code)
      self.sign_up_code[:qr_code_img] = self.sign_up_code.generate_qr_code_image(self.id)
      self.sign_up_code[:created_ts] = now
      self.sign_up_code[:update_ts] = now
      save
    end
  end
  
  def update_sign_up_code
    now = Time.now
    sign_up_auth_code = "#{self.id}"
    data =  {
      :auth_code => sign_up_auth_code
    }.to_json
    cipher = Gibberish::AES.new(self.auth_code)
    encrypted_data = cipher.enc(data)
    encrypted_code = "m#{self.id}$#{encrypted_data}"
    self.sign_up_code.auth_code = sign_up_auth_code
    self.sign_up_code.qr_code = SignUpCode.generate_qr_code(self.id, encrypted_code)
    self.sign_up_code.qr_code_img = self.sign_up_code.generate_qr_code_image(self.id)
    self.sign_up_code.update_ts = now
    save   
  end
  
  private

  def convert_date(field, field_str)
    begin
      date_str = self.send(field_str)
      if date_str
        self[field] = Time.zone.parse(date_str).to_date
      end
      return true
    rescue ArgumentError
      return false
    end
  end

  def check_type_id
    if self.type
      return true
    end
    return [false, ValidationErrors.default_error_message(:blank, :type_id)]
  end

  def check_visit_frequency_id
    if self.visit_frequency
      return true
    end
    return [false, ValidationErrors.default_error_message(:blank, :visit_frequency_id)]
  end

  def validate_date(n,v)
    convert_date(n.to_sym, v) ? true : [false, "#{n.gsub('_',' ').capitalize} #{I18n.t('errors.messages.not_valid')}"]
  end

  def validate_termination_date
    if self.will_terminate
      valid = validate_date("termination_date", "termination_date_str")
      return valid if valid.kind_of?(Array)

      today = Date.today
      if self.termination_date < today
        return [false, I18n.t('admin.merchants.min_termination_date')]
      end
    end
    return true
  end
  
  def validate_phone
    self.phone.gsub!(/\-/, "")
    if !self.phone.match(/^[\d]+$/) || self.phone.length != 10
      return [false, I18n.t('errors.messages.phone_format', :attribute => I18n.t('activemodel.attributes.contact.phone')) % [10]]
    end
    return true
  end
end
