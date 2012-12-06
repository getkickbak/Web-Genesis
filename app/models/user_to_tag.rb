class UserToTag
  include DataMapper::Resource

  belongs_to :user, :key => true
  belongs_to :user_tag, :key => true
end