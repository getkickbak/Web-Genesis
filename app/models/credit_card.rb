require 'util/constant'

class CreditCard
  include DataMapper::Resource

  property :id, Serial
  property :card_token, String, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessible :card_token
    
  def self.create(card_info)
    credit_card = CreditCard.new(
      :card_token=> card_info[:card_token]
    )  
    credit_card[:created_ts] = now
    credit_card[:update_ts] = now
    credit_card.save
    return credit_card
  end
    
  def update()
    now = Time.now
    self.update_ts = now
    save
  end
end