require 'util/constant'

class User
  include DataMapper::Resource

  Roles = %w[test anonymous user admin]
  Statuses = [:active, :pending, :suspended, :deleted]
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable

  devise :database_authenticatable, :registerable, #:confirmable,
          :recoverable, :rememberable, :trackable, #:timeoutable,
          :validatable, :token_authenticatable, :authentication_keys => [:email]
          
  property :id, Serial
  property :name, String, :required => true, :default => ""
  ## Database authenticatable
  property :email, String, :unique_index => true, :required => true, :format => :email_address, :default => ""
  property :phone, String, :unique_index => true, :default => ""
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
  property :facebook_id, String, :default => ""     
  property :facebook_email, String, :default => ""
  property :role, String, :required => true, :default => "anonymous"
  property :status, Enum[:active, :pending, :suspended, :deleted], :required => true, :default => :active
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessor :current_password, :tag_id
  
  attr_accessible :name, :email, :facebook_id, :facebook_email, :role, :status, :current_password, :password, :password_confirmation, :tag_id
    
  has 1, :profile, 'UserProfile', :constraint => :destroy
  has 1, :user_to_virtual_tag, :constraint => :destroy
  has 1, :virtual_tag, 'UserTag', :through => :user_to_virtual_tag,  :via => :user_tag
  has n, :user_to_tags, :constraint => :destroy
  has n, :tags, 'UserTag', :through => :user_to_tags,  :via => :user_tag
  has n, :friendships, :child_key => [ :source_id ], :constraint => :destroy
  has n, :friends, self, :through => :friendships, :via => :target
  has n, :links_to_followed_users, 'Relationship', :child_key => [ :follower_id ], :constraint => :destroy
  has n, :links_to_followers, 'Relationship', :child_key => [ :followed_id ], :constraint => :destroy
  has n, :followed_users, self, :through => :links_to_followed_users, :via => :followed
  has n, :followers, self, :through => :links_to_followers, :via => :follower
  has n, :user_credit_cards, :child_key => [ :user_id ], :constraint => :destroy
  has n, :credit_cards, :through => :user_credit_cards, :via => :credit_card
    
  validates_with_method :phone, :method => :validate_phone  
  validates_with_method :tag_id, :method => :validate_tag_id
    
  before_save :ensure_authentication_token
  
  def self.create(user_info)
    now = Time.now
    if (user_info.is_a? Hash) || (user_info.is_a? ActiveSupport::HashWithIndifferentAccess)
      name = user_info[:name].strip
      email = user_info[:email].strip
      phone = user_info[:phone].strip
      password = user_info[:password].strip
      facebook_id = user_info[:facebook_id]
      facebook_email = user_info[:facebook_email]
      role = user_info[:role]
      status = user_info[:status]
      gender = user_info[:gender]
      birthday = user_info[:birthday]
      tag_id = user_info[:tag_id]
    else
      name = user_info.name.strip
      email = user_info.email.strip
      phone = user_info.phone.strip
      password = user_info.password.strip
      password_confirmation = user_info.password_confirmation.strip
      role = user_info.role
      status = user_info.status
      gender = :u
      birthday = ::Constant::MIN_DATE
      tag_id = user_info.tag_id.strip
    end  
    
    validate_user = false
    if tag_id
      user_tag = UserTag.first(:tag_id => tag_id)
      if user_tag.nil?
        validate_user = true
      else
        user_to_tag = UserToTag.first(:user_tag_id => user_tag.id)
        if user_to_tag.nil?
          validate_user = true
        else
          if user_to_tag.user_tag.status == :pending
            user = user_to_tag.user
            user.name = name
            user.email = email
            user.password = password
            user.password_confirmation = password_confirmation
            user.update_ts = now
            user_tag = user_to_tag.user_tag
            user_tag.status = :active
            user_tag.update_ts = now
            user_tag.save
          else
            validate_user = true
          end   
        end  
      end  
    end
    
    if validate_user || tag_id.nil?
      user = User.new(
        {
          :name => name,
          :email => email,   
          :phone => phone,
          :facebook_id => facebook_id,
          :facebook_email => facebook_email,
          :current_password => password,
          :password => password,
          :password_confirmation => password_confirmation || password,
          :role => role,
          :status => status,
          :tag_id => tag_id
        }.delete_if { |k,v| v.nil? }
      ) 
      user[:created_ts] = now
      user[:update_ts] = now
      user.profile = UserProfile.new(
        :gender => gender || :u,
        :birthday => birthday || ::Constant::MIN_DATE       
      )
      user.profile[:created_ts] = now
      user.profile[:update_ts] = now
    end
    user.virtual_tag = UserTag.create(:virtual)
    user.save
    return user 
  end
    
  def to_param
    self.id
  end
  
  def password_required?
    !self.current_password.nil? 
  end
  
  def update_all(user_info)
    now = Time.now
    self.name = user_info[:name].strip
    self.email = user_info[:email].strip
    self.phone = user_info[:phone].strip
    if !user_info[:current_password].empty?
      self.current_password = user_info[:current_password].strip
      if self.current_password && !valid_password?(self.current_password)
        errors.add(:current_password, I18n.t("errors.messages.user.incorrect_password"))
        raise DataMapper::SaveFailureError.new("", self)
      end
      if self.current_password == user_info[:password].strip
        errors.add(:password, I18n.t("errors.messages.user.reuse_password"))
        raise DataMapper::SaveFailureError.new("", self)
      end
      self.password = user_info[:password].strip
      self.password_confirmation = user_info[:password_confirmation].strip
    else
      self.current_password = nil
    end
    self.role = user_info[:role]
    self.status = user_info[:status]
    self.update_ts = now
    save
  end
  
  def register_tag(tag)
    if tag.status != :virtual
      tag.status = :active
      tag.update_ts = Time.now
      tag.save
    end
    self.tags.concat(Array(tag))
    save  
  end
  
  def deregister_tag(tag)
    if tag.status != :virtual
      tag.status = :deleted
      tag.update_ts = Time.now
      tag.save
      self.user_to_tags.all(:user_tag => Array(tag)).destroy
      reload
    end
  end
  
  def follow(others)
    self.followed_users.concat(Array(others))
    save
  end
  
  def unfollow(others)
    self.links_to_followed_users.all(:followed => Array(others)).destroy
    reload
  end
  
  def add_friend(friend)
    self.friends.concat(Array(friend))
  end
  
  def remove_friend(friend)
    self.friendships.all(:target => Array(friend)).destroy
    reload
  end
    
  def add_credit_card(credit_card)
    self.credit_cards.concat(Array(credit_card))
    save
  end
  
  def remove_credit_card(credit_card)
    self.user_credit_cards.all(:credit_card => Array(credit_card)).destroy
    reload
  end
  
  private
  
  def validate_tag_id
    if self.tag_id
      return [false, I18n.t('users.invalid_tag')] if (user_tag = UserTag.first(:tag_id => self.tag_id)).nil?
      tag_id = user_tag.id
      user_to_tag = UserToTag.first(:user_tag_id => tag_id)
      if user_to_tag.nil? || user_to_tag.user_tag.status != :pending
        return [false, I18n.t('users.invalid_tag')]        
      end    
    end
    return true
  end
  
  def validate_phone
    if not self.phone.empty?
      if not self.phone.match(/^[\d]+$/)
        return [false, I18n.t('errors.messages.phone_format', :attribute => I18n.t('activemodel.attributes.contact.phone'))]
      end
    end
    return true
  end
end
