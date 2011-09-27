module DealsHelper
  def get_referrers(deal_id,max)
    referrers = Referral.get_referrers(deal_id, max)
  end
end
