require 'singleton'

class ReferralService
  include Singleton
  
  def create_referral(deal, creator, referral_info)
    now = Time.now
    referral = Referral.new
    referral[:referral_num] = 0
    referral[:created_ts] = now
    referral[:update_ts] = now
    referral.creator = creator
    referral.deal = deal
    referral.save
    return referral
  end

  def get_referral(referral_id)
    Referral.get!(referral_id)
  end

  def get_referrals_created_by(user_id, start, max)
    Referral.all(Referral.creator.id => user_id, :order => [ :created_ts.desc ], :offset => start, :limit => max)
  end

  def get_referrals_received(user_id, start, max)
    referral_ids = repository(:default).adapter.select(
      'SELECT id FROM referrals WHERE creator_id IN 
        (SELECT followed_id FROM relationships WHERE follower_id = ?)
        OR creator_id = ? 
        ORDER BY created_ts DESC
        LIMIT ?,?', user_id, user_id, start, max
    )
    referrals = Referral.all(:id => referral_ids)
  end
  
  def remove_referral

  end
end