require 'digest'
require 'util/constant'

class User
  include DataMapper::Resource

  ROLES = %w[anoymous user admin super_admin]
   
=begin   
  devise :database_authenticatable, :registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, 
          :validatable
=end
  property :id, Serial
  property :user_id, String, :unique_index => true, :required => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :email, String, :required => true, :format => :email_address, :default => ""
  property :salt, String, :default => ""         
  property :facebook_id, String, :required => true, :unique => true, :default => ""     
  property :facebook_uid, String, :required => true, :default => ""   
  #property :encrypted_password, String, :required => false, :length => 255
  property :photo_url, String, :default => ""
  property :role, String, :default => "anonymous"
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  #attr_accessible :name, :email, :password, :password_confirmation
  attr_accessible :name, :email, :facebook_id, :facebook_uid
    
  has 1, :profile, 'UserProfile'
  has n, :friendships, :child_key => [ :source_id ]
  has n, :friends, self, :through => :friendships, :via => :target
  has n, :links_to_followed_users, 'Relationship', :child_key => [ :follower_id ]
  has n, :links_to_followers, 'Relationship', :child_key => [ :followed_id ]
  has n, :followed_users, self, :through => :links_to_followed_users, :via => :followed
  has n, :followers, self, :through => :links_to_followers, :via => :follower
    
  before :save, :make_salt  
=begin    
  def self.create(user)
    now = Time.now
    user[:created_ts] = now
    user[:update_ts] = now
    user[:role] = "user"
    user.profile = UserProfile.new(
      :gender => :u,
      :birthday => now       
    )
    user.profile[:created_ts] = now
    user.profile[:update_ts] = now
    user.save
    return user
  end
=end

  def self.create(user_info)
    now = Time.now
    user = User.new(
      :name => user_info[:name],
      :email => user_info[:email],   
      :facebook_id => user_info[:facebook_id],
      :facebook_uid => user_info[:facebook_uid]
    ) 
    user[:user_id] = "#{user_info[:name].downcase.gsub(' ','-')}-#{rand(1000) + 1000}#{now.to_i}"
    user[:created_ts] = now
    user[:update_ts] = now
    user[:role] = "user"
    user.profile = UserProfile.new(
      :gender => user_info[:gender],
      :birthday => user_info[:birthday]       
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
  
  def self.authenticate_with_salt(id, cookie_salt)
    user = get(id)
    (user && user.salt == cookie_salt) ? user : nil
  end
  
  def update(account_info)
    now = Time.now
    self.attributes = account_info
    self.update_ts = now
    save
  end
  
  def follow(others)
    followed_users.concat(Array(others))
    save
    self
  end
  
  def unfollow(others)
    links_to_followed_users.all(:followed => Array(others)).destroy
    reload
    self
  end
  
  def add_friend(friend)
    friends.concat(Array(friend))
  end
  
  def remove_friend(friend)
    friendships.all(:target => Array(friend)).destroy
    reload
    self
  end
    
  def as_json(options)
    only = {:only => [:name, :facebook_id]}
    options = options.nil? ? only : options.merge(only)
     super(options)
  end
    
  private
    
    def make_salt
      self.salt = secure_hash("#{Time.now.utc}--#{self.facebook_id}")
    end

    def secure_hash(string)
      Digest::SHA2.hexdigest(string)
    end  
end
