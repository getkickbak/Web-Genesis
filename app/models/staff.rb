require 'util/constant'

class Staff
  include DataMapper::Resource

  ROLES = %w[sales admin super_admin]
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, #:registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, 
          :validatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :staff_id, String, :unique_index => true, :required => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :email, String, :unique_index => true, :required => true, :format => :email_address, :default => ""
  property :encrypted_password, String, :required => true, :default => ""
  property :photo_url, String, :default => ""
  property :role, String, :default => "sales"
  property :status, Enum[:active, :suspended, :deleted], :default => :active
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessible :name, :email, :password, :password_confirmation, :encrypted_password
    
  validates_presence_of :password, :password_confirmation
  validates_length_of :password, :min => 6, :max => 40
  validates_confirmation_of :password
        
  def self.create(staff_info, password, password_confirmation)
    now = Time.now
    staff = Staff.new(
      :name => staff_info[:name].strip,
      :email => staff_info[:email].strip,   
      :password => password.strip,
      :password_confirmation => password_confirmation.strip,
      :encrypted_password => staff_info[:encrypted_password]
    ) 
    staff[:staff_id] = "#{staff_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    staff[:created_ts] = now
    staff[:update_ts] = now
    staff.save
    return staff 
  end
  
  def self.create_without_devise(staff_info)
    staff_info[:encrypted_password] = encrypt_password(staff_info[:password])
    self.create(staff_info, staff_info[:password], staff_info[:password_confirmation])
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
  
  def password_required?  
    !self.password.blank? && super  
  end
  
  def to_param
    self.staff_id
  end
  
  def update(staff_info)
    now = Time.now
    self.staff_id = "#{staff_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    self.name = staff_info[:name]
    self.email = staff_info[:email]
    self.password = staff_info[:password]
    self.password_confirmation = staff_info[:password_confirmation]
    self.encrypted_password = User.encrypt_password(self.password)
    self.update_ts = now
    save
  end
  
  def as_json(options)
    only = {:only => [:name]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def self.encrypt_password(password)
    BCrypt::Password.create(password)
  end
end
