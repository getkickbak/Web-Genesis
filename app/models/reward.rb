class Reward
  include DataMapper::Resource
  
  property :referral_id, Integer, :key => true
  property :reward_code, String, :unique_index => true,  :required => true
  property :qr_code, String, :default => ""
  property :redeemed, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :referral_id, :reward_code
  
  belongs_to :deal
  belongs_to :user
  
  def self.create(deal, user, referral_id)
    now = Time.now
    #url = "http://www.cnn.com"
    #filename = "where_is_this"
    #qr = RQR::QRCode.new()
    #qr.save(url,file_name, :png)
    reward = Reward.new(
      :referral_id => referral_id,
      :reward_code => "#{now.to_i}#{rand(1000) + 1000}"
      #:qr_code => filename
    )
    reward[:created_ts] = now
    reward[:update_ts] = now
    reward.deal = deal
    reward.user = user
    reward.save
    return reward
  end
end