require 'util/constant'

class User
  include DataMapper::Resource

  devise :database_authenticatable, :registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, 
          :validatable

  property :id, Serial
  property :name, String, :required => true
  property :email, String, :required => true, :unique => true,
            :format => :email_address
  property :encrypted_password, String, :required => true, :length => 255
  property :photo_url, String, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessible :name, :email, :password, :password_confirmation
    
  has 1, :profile, 'UserProfile'
  has n, :friendships, :child_key => [ :source_id ]
  has n, :friends, self, :through => :friendships, :via => :target
  has n, :links_to_followed_users, 'Relationship', :child_key => [ :follower_id ]
  has n, :links_to_followers, 'Relationship', :child_key => [ :followed_id ]
  has n, :followed_users, self, :through => :links_to_followed_users, :via => :followed
  has n, :followers, self, :through => :links_to_followers, :via => :follower
    
  def has_password?(submitted_password)
    encrypted_password == encrypt(submitted_password)    
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
    
end
