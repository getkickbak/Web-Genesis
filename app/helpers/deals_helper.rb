module DealsHelper
  def get_referrers(deal_id,max)
    referrers = Referral.find_referrers(deal_id, max)
  end
end
