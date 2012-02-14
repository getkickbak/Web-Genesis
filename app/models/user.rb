require 'util/constant'

class User
  include DataMapper::Resource

  ROLES = %w[anonymous user]
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, :registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, 
          :validatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :user_id, String, :unique_index => true, :required => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :email, String, :unique_index => true, :required => true, :format => :email_address, :default => ""
  property :encrypted_password, String, :required => true, :default => ""
  property :facebook_id, String, :default => ""     
  property :photo_url, String, :default => ""
  property :role, String, :required => true, :default => "anonymous"
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :active
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessible :name, :email, :facebook_id, :role, :status, :password, :password_confirmation, :encrypted_password
    
  has 1, :profile, 'UserProfile', :constraint => :destroy
  has n, :friendships, :child_key => [ :source_id ], :constraint => :destroy
  has n, :friends, self, :through => :friendships, :via => :target
  has n, :links_to_followed_users, 'Relationship', :child_key => [ :follower_id ], :constraint => :destroy
  has n, :links_to_followers, 'Relationship', :child_key => [ :followed_id ], :constraint => :destroy
  has n, :followed_users, self, :through => :links_to_followed_users, :via => :followed
  has n, :followers, self, :through => :links_to_followers, :via => :follower
  has n, :user_credit_cards, :child_key => [ :user_id ], :constraint => :destroy
  has n, :credit_cards, :through => :user_credit_cards, :via => :credit_card
    
  def self.create(user_info, password, password_confirmation)
    now = Time.now
    user = User.new(
      :name => user_info[:name].strip,
      :email => user_info[:email].strip,   
      :password => password.strip,
      :password_confirmation => password_confirmation.strip,
      :encrypted_password => user_info[:encrypted_password],
      :role => user_info[:role].strip,
      :status => user_info[:status]
    ) 
    user[:user_id] = "#{user_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    user[:created_ts] = now
    user[:update_ts] = now
    user.profile = UserProfile.new
    user.profile[:created_ts] = now
    user.profile[:update_ts] = now
    user.save
    return user 
  end
  
  def self.create_without_devise(user_info)
    user_info[:encrypted_password] = encrypt_password(user_info[:password])
    self.create(user_info, user_info[:password], user_info[:password_confirmation])
  end
  
  def self.create_from_facebook(user_info)
    now = Time.now
    password = String.random_alphanumeric
    user = User.new(
      :name => user_info[:name].strip,
      :email => user_info[:email].strip,   
      :facebook_id => user_info[:facebook_id],
      :password => password,
      :password_confirmation => password,
      :encrypted_password => self.encrypt_password(password),
      :role => "user",
      :status => :active
    ) 
    user[:user_id] = "#{user_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    user[:created_ts] = now
    user[:update_ts] = now
    user[:role] = "user"
    user.profile = UserProfile.new(
      :gender =>  user_info[:gender] || :u,
      :birthday => user_info[:birthday] || ::Constant::MIN_DATE       
    )  
    user.profile[:created_ts] = now
    user.profile[:update_ts] = now
    user.save
    return user
  end
  
  def self.find(start, max)
    count = User.count
    users = User.all(:offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = users
    #return result
    return users  
  end
    
  def to_param
    self.user_id
  end
  
  def update_all(user_info)
    now = Time.now
    self.user_id = "#{user_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    self.name = user_info[:name].strip
    self.email = user_info[:email].strip
    self.password = user_info[:password].strip
    self.password_confirmation = user_info[:password_confirmation].strip
    self.encrypted_password = User.encrypt_password(self.password)
    self.role = user_info[:role].strip
    self.status = user_info[:status]
    self.update_ts = now
    save
  end
  
  def follow(others)
    self.followed_users.concat(Array(others))
    save
    self
  end
  
  def unfollow(others)
    self.links_to_followed_users.all(:followed => Array(others)).destroy
    reload
    self
  end
  
  def add_friend(friend)
    self.friends.concat(Array(friend))
  end
  
  def remove_friend(friend)
    self.friendships.all(:target => Array(friend)).destroy
    reload
    self
  end
    
  def add_credit_card(credit_card)
    credit_cards.concat(Array(credit_card))
    save
    self
  end
  
  def remove_credit_card(credit_card)
    user_credit_cards.all(:credit_card => Array(credit_card)).destroy
    reload
    self
  end
    
  def as_json(options)
    only = {:only => [:name,:email]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  private
  
  def self.encrypt_password(password)
    BCrypt::Password.create(password)
  end
end
