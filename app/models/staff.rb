require 'util/constant'

class Staff
  include DataMapper::Resource

  Roles = %w[sales admin super_admin]
  Statuses = [:active, :pending, :suspended, :deleted]
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, #:registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, :timeoutable,
          :validatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :name, String, :required => true, :default => ""
  ## Database authenticatable
  property :email, String, :unique_index => true, :required => true, :format => :email_address, :default => ""
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
  property :role, String, :required => true, :default => "sales"
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :active
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessor :current_password
    
  attr_accessible :name, :email, :role, :status, :current_password, :password, :password_confirmation
        
  def self.create(staff_info)
    now = Time.now
    if (staff_info.is_a? Hash) || (staff_info.is_a? ActiveSupport::HashWithIndifferentAccess)
      name = staff_info[:name].strip
      email = staff_info[:email].strip
      password = staff_info[:password].strip
      password_confirmation = staff_info[:password_confirmation].strip
      role = staff_info[:role]
      status = staff_info[:status]
    else
      name = staff_info.name
      email = staff_info.email
      password = staff_info.password
      password_confirmation = staff_info.password_confirmation
      role = staff_info.role
      status = staff_info.status
    end
    staff = Staff.new(
      :name => name,
      :email => email,  
      :current_password => password,
      :password => password,
      :password_confirmation => password_confirmation,
      :role => role,
      :status => status
    ) 
    staff[:created_ts] = now
    staff[:update_ts] = now
    staff.save
    return staff 
  end
  
  def to_param
    self.id
  end
  
   def password_required?
    !self.current_password.nil? 
  end
  
  # Override Devise::mailer
  def devise_mailer
    Admin::StaffDevise::Mailer
  end
  
  def update_all(staff_info)
    now = Time.now
    self.name = staff_info[:name].strip
    self.email = staff_info[:email].strip
    if !staff_info[:current_password].empty?
      self.current_password = staff_info[:current_password].strip
      if self.current_password && !valid_password?(self.current_password)
        errors.add(:current_password, I18n.t("errors.messages.staff.incorrect_password"))
        raise DataMapper::SaveFailureError.new("", self)
      end
      if self.current_password == staff_info[:password].strip
        errors.add(:password, I18n.t("errors.messages.staff.reuse_password"))
        raise DataMapper::SaveFailureError.new("", self)
      end  
      self.password = staff_info[:password].strip
      self.password_confirmation = staff_info[:password_confirmation].strip
    else
      self.current_password = nil
    end  
    self.role = staff_info[:role]
    self.status = staff_info[:status]
    self.update_ts = now
    save
  end
end
