class CustomerRewardVenue
  include DataMapper::Resource

  belongs_to :customer_reward, :key => true
  belongs_to :venue, :key => true
end