module MerchantSummaryNewsletters
  @queue = :merchant_summary_newsletters
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/merchant_summary_newsletters.log")
  end

  def self.perform()
    now = Time.now
    logger.info("MerchantSummaryNewsletters started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    beginning_of_last_week = 1.week.ago.beginning_of_week
    end_of_last_week = 1.week.ago.end_of_week
    #beginning_of_last_week = Date.today.beginning_of_week
    #end_of_last_week = Date.today.end_of_week
    merchants = Merchant.all
    merchants.each do |merchant|
      total_customer_count = Customer.count(Customer.merchant.id => merchant.id)
      new_customer_count = Customer.count(Customer.merchant.id => merchant.id, :created_ts => (beginning_of_last_week..end_of_last_week))
      total_reward_points = EarnRewardRecord.sum(:points, :merchant => merchant) - RedeemRewardRecord.sum(:points, :merchant => merchant)
      new_reward_points_earned = EarnRewardRecord.sum(:points, :merchant => merchant, :created_ts => (beginning_of_last_week..end_of_last_week))
      new_reward_points_redeemed = RedeemRewardRecord.sum(:points, :merchant => merchant, :created_ts => (beginning_of_last_week..end_of_last_week))
      new_purchases_count = EarnRewardRecord.count(:merchant => merchant, :challenge_id => 0, :created_ts => (beginning_of_last_week..end_of_last_week))
      new_challenges_count = EarnRewardRecord.count(:merchant => merchant, :challenge_id.gt => 0, :created_ts => (beginning_of_last_week..end_of_last_week))
      new_challenges_indv_count = []
      challenges = Challenge.all(Challenge.merchant.id => merchant.id)
      challenges.each do |challenge|
        count = EarnRewardRecord.count(:challenge_id => challenge.id, :created_ts => (beginning_of_last_week..end_of_last_week))
        percentage = new_challenges_count > 0 ? (count / Float(new_challenges_count) * 100) : 0
        new_challenges_indv_count << {:name => challenge.name, :count => count, :percentage => percentage}
      end
      stats = {
        :total_customer_count => total_customer_count,
        :new_customer_count => new_customer_count,
        :total_reward_points => total_reward_points,
        :new_reward_points_earned => new_reward_points_earned,
        :new_reward_points_redeemed => new_reward_points_redeemed,
        :new_purchases_count => new_purchases_count,
        :new_challenges_count => new_challenges_count,
        :new_challenges_indv_count => new_challenges_indv_count
      }
      Business::MerchantMailer.summary_newsletter_email(merchant,stats).deliver
    end
    logger.info("MerchantSummaryNewsletters completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end