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
  property :role, String, :required => true, :default => "sales"
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :active
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessible :name, :email, :role, :status, :password, :password_confirmation, :encrypted_password
        
  def self.create(staff_info, password, password_confirmation)
    now = Time.now
    staff = Staff.new(
      :name => staff_info[:name].strip,
      :email => staff_info[:email].strip,   
      :password => password.strip,
      :password_confirmation => password_confirmation.strip,
      :encrypted_password => staff_info[:encrypted_password],
      :role => staff_info[:role].strip,
      :status => staff_info[:status]
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
  
  def to_param
    self.staff_id
  end
  
  def update_all(staff_info)
    now = Time.now
    self.staff_id = "#{staff_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    self.name = staff_info[:name].strip
    self.email = staff_info[:email].strip
    self.password = staff_info[:password].strip
    self.password_confirmation = staff_info[:password_confirmation].strip
    self.encrypted_password = User.encrypt_password(self.password)
    self.role = staff_info[:role].strip
    self.status = staff_info[:status]
    self.update_ts = now
    save
  end
  
  private
  
  def self.encrypt_password(password)
    BCrypt::Password.create(password)
  end
end
