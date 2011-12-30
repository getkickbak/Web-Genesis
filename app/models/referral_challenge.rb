require 'util/constant'

class ReferralChallenge
  include DataMapper::Resource

  property :ref_email, String, :key => true, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  attr_accessible :ref_email
  
  belongs_to :user, :key => true
  belongs_to :merchant, :key => true
  
  def self.create(merchant, user, referral_info)
    now = Time.now
    referral = ReferralChallenge.new(
      :ref_email => referral_info[:ref_email]
    )
    referral[:created_ts] = now
    referral[:update_ts] = now
    referral.merchant = merchant
    referral.user = user
    referral.save
    return referral
  end
end