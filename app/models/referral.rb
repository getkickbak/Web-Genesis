require 'util/constant'

class Referral
  include DataMapper::Resource

  property :id, Serial
  property :referral_id, String, :unique_index => true, :required => true, :default => 0
  property :photo_url, String, :required => true, :default => ""
  property :comment, String, :length => 1024, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :photo_url, :comment

  belongs_to :creator, 'User'
  belongs_to :deal
  
  def self.create(deal, creator, referral_info)
    now = Time.now
    referral = Referral.new(
      :photo_url => referral_info[:photo_url],
      :comment => referral_info[:comment].strip
    )
    referral[:referral_id] = "#{rand(1000) + 2000}#{now.to_i}"
    referral[:created_ts] = now
    referral[:update_ts] = now
    referral.creator = creator
    referral.deal = deal
    referral.save
    
    return referral
  end

  def self.find_created_by(user_id, start, max)
    referrals = Referral.all(Referral.creator.id => user_id, :order => [ :created_ts.desc ], :offset => start, :limit => max)
    #result = {}
    #result[:total] = count
    #result[:items] = referrals
    #return result
    return referrals
  end

  def self.find_received_by(user_id, start, max)
    referral_ids = DataMapper.repository(:default).adapter.select(
      "SELECT id FROM referrals WHERE creator_id IN 
        (SELECT followed_id FROM relationships WHERE follower_id = ?)
        OR creator_id = ? 
        ORDER BY created_ts DESC
        LIMIT ?,?", user_id, user_id, start, max
    )
    referrals = Referral.all(:id => referral_ids)
    #result = {}
    #result[:total] = count
    #result[:items] = referrals
    #return result
    return referrals
  end

  def self.find_by_deal(deal_id, start, max)
    count = Referral.count(Referral.deal.id => deal_id)
    referrals = Referral.all(Referral.deal.id => deal_id, :order => [ :created_ts.desc ], :offset => start, :limit => max)
    result = {}
    result[:total] = count
    result[:items] = referrals
    return result
  end  

  def self.find_referrers(deal_id, current_referrer_id, max)
    count = Referral.count(Referral.deal.id => deal_id)
    referrer_ids = DataMapper.repository(:default).adapter.select(
      "SELECT creator_id FROM referrals WHERE deal_id = ?
       ORDER BY created_ts DESC 
       LIMIT 0,?", deal_id, max 
    )
    referrers = User.all(:id => referrer_ids)
    result = {}
    result[:total] = count
    result[:items] = referrers
    return result
  end  
end