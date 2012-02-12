class UserCreditCard
  include DataMapper::Resource

  belongs_to :credit_card, :key => true
  belongs_to :user, :key => true
end