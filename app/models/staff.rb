require 'util/constant'

class Staff
  include DataMapper::Resource

  ROLES = %w[sales admin super_admin]
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, :registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, 
          :validatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :name, String, :required => true, :default => ""
  property :email, String, :unique_index => true, :required => true, :format => :email_address, :default => ""
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
    password = staff_info[:password] ? staff_info[:password].strip : staff_info.password
    password_confirmation  = staff_info[:password_confirmation] ? staff_info[:password_confirmation].strip : staff_info.password_confirmation
    staff = Staff.new(
      :name => staff_info[:name].strip,
      :email => staff_info[:email].strip,  
      :current_password => password,
      :password => password,
      :password_confirmation => password_confirmation,
      :role => staff_info[:role].strip,
      :status => staff_info[:status]
    ) 
    staff[:created_ts] = now
    staff[:update_ts] = now
    staff.save
    return staff 
  end
  
  def self.find(start, max)
    count = Staff.count
    staffs = Staff.all(:offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = staffs
    #return result
    return staffs  
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
        errors.add(:current_password, "Incorrect password")
        raise DataMapper::SaveFailureError.new("", self)
      end
      if self.current_password == staff_info[:password].strip
        errors.add(:password, "New password must be different from current password")
        raise DataMapper::SaveFailureError.new("", self)
      end  
      self.password = staff_info[:password].strip
      self.password_confirmation = staff_info[:password_confirmation].strip
    else
      self.current_password = nil
    end  
    self.role = staff_info[:role].strip
    self.status = staff_info[:status]
    self.update_ts = now
    save
  end
end
