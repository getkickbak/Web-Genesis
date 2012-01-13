class PurchaseRewardVenue
  include DataMapper::Resource

  belongs_to :purchase_reward, :key => true
  belongs_to :venue, :key => true
end