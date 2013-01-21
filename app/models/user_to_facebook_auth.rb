class UserToFacebookAuth
  include DataMapper::Resource

  belongs_to :user, :key => true
  belongs_to :third_party_auth, :key => true
end