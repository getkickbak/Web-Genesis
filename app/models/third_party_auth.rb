require 'util/constant'

class ThirdPartyAuth
  include DataMapper::Resource
  
  property :id, Serial
  property :provider, String, :required => true, :default => ""
  property :uid, String, :required => true, :default => ""
  property :token, String, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :provider, :uid, :token
  
  belongs_to :user
  
  def create(user, third_party_auth_info)
    now = Time.now
    third_party_auth = ThirdPartyAuth.new(
      :provider => third_party_auth_info[:provider],
      :uid => third_party_auth_info[:uid],
      :token => third_party_auth_info[:token]
    )
    third_party_auth[:created_ts] = now
    third_party_auth[:update_ts] = now
    third_party.user = user
    third_party_auth.save
    return third_party_auth
  end  
end