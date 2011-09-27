module DealsHelper
  def get_referrers(deal_id, current_referrer_id, max)
    referrers = Referral.find_referrers(deal_id, current_referrer_id, max)
  end
end
