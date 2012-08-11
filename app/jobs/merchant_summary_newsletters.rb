module MerchantSummaryNewsletters
  @queue = :merchant_summary_newsletters
  
  def self.logger
    @logger ||= Logger.new("#{Rails.root}/log/merchant_summary_newsletters.log")
  end

  def self.perform()
    now = Time.now
    logger.info("Merchant Summary Newsletters started at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
    beginning_of_last_week = 1.week.ago.beginning_of_week
    end_of_last_week = 1.week.ago.end_of_week
    #beginning_of_last_week = Date.today.beginning_of_week
    #end_of_last_week = Date.today.end_of_week
    merchants = Merchant.all
    merchants.each do |merchant|
      total_customer_count = Customer.count(Customer.merchant.id => merchant.id)
      new_customer_count = Customer.count(Customer.merchant.id => merchant.id, :created_ts => (beginning_of_last_week..end_of_last_week))
      total_spend = EarnRewardRecord.sum(:amount, :merchant => merchant) || 0
      new_total_spend = EarnRewardRecord.sum(:amount, :merchant => merchant, :created_ts => (beginning_of_last_week..end_of_last_week)) || 0
      total_reward_points = (EarnRewardRecord.sum(:points, :merchant => merchant) || 0) - (RedeemRewardRecord.sum(:points, :merchant => merchant, :mode => :reward) || 0)
      total_reward_points_earned = EarnRewardRecord.sum(:points, :merchant => merchant) || 0
      new_reward_points_earned = EarnRewardRecord.sum(:points, :merchant => merchant, :created_ts => (beginning_of_last_week..end_of_last_week)) || 0
      total_reward_points_redeemed = RedeemRewardRecord.sum(:points, :merchant => merchant, :mode => :reward) || 0
      new_reward_points_redeemed = RedeemRewardRecord.sum(:points, :merchant => merchant, :mode => :reward, :created_ts => (beginning_of_last_week..end_of_last_week)) || 0
      total_prize_points = (EarnPrizeRecord.sum(:points, :merchant => merchant) || 0) - (RedeemRewardRecord.sum(:points, :merchant => merchant, :mode => :prize) || 0)
      total_prize_points_earned = EarnPrizeRecord.sum(:points, :merchant => merchant) || 0
      new_prize_points_earned = EarnPrizeRecord.sum(:points, :merchant => merchant, :created_ts => (beginning_of_last_week..end_of_last_week)) || 0
      total_prize_points_redeemed = RedeemRewardRecord.sum(:points, :merchant => merchant, :mode => :prize) || 0
      new_prize_points_redeemed = RedeemRewardRecord.sum(:points, :merchant => merchant, :mode => :prize, :created_ts => (beginning_of_last_week..end_of_last_week)) || 0
      total_purchases_count = EarnRewardRecord.count(:merchant => merchant, :type => :purchase)
      new_purchases_count = EarnRewardRecord.count(:merchant => merchant, :type => :purchase, :created_ts => (beginning_of_last_week..end_of_last_week))
      total_challenges_count = EarnRewardRecord.count(:merchant => merchant, :type => :challenge)
      new_challenges_count = EarnRewardRecord.count(:merchant => merchant, :type => :challenge, :created_ts => (beginning_of_last_week..end_of_last_week))
      challenges = Challenge.all(Challenge.merchant.id => merchant.id)
      total_challenges_indv_count = []
      challenges.each do |challenge|
        count = EarnRewardRecord.count(:type => :challenge, :ref_id => challenge.id)
        percentage = total_challenges_count > 0 ? (count / Float(total_challenges_count) * 100) : 0
        total_challenges_indv_count << {:name => challenge.name, :count => count, :percentage => percentage}
      end
      new_challenges_indv_count = []
      challenges.each do |challenge|
        count = EarnRewardRecord.count(:type => :challenge, :ref_id => challenge.id, :created_ts => (beginning_of_last_week..end_of_last_week))
        percentage = new_challenges_count > 0 ? (count / Float(new_challenges_count) * 100) : 0
        new_challenges_indv_count << {:name => challenge.name, :count => count, :percentage => percentage}
      end
      stats = {
        :total_customer_count => total_customer_count,
        :new_customer_count => new_customer_count,
        :total_spend => total_spend,
        :new_total_spend => new_total_spend,
        :total_reward_points => total_reward_points,
        :total_reward_points_earned => total_reward_points_earned,
        :new_reward_points_earned => new_reward_points_earned,
        :total_reward_points_redeemed => total_reward_points_redeemed,
        :new_reward_points_redeemed => new_reward_points_redeemed,
        :total_prize_points => total_prize_points,
        :total_prize_points_earned => total_prize_points_earned,
        :new_prize_points_earned => new_prize_points_earned,
        :total_prize_points_redeemed => total_prize_points_redeemed,
        :new_prize_points_redeemed => new_prize_points_redeemed,
        :total_purchases_count => total_purchases_count,
        :new_purchases_count => new_purchases_count,
        :total_challenges_count => total_challenges_count,
        :total_challenges_indv_count => total_challenges_indv_count,
        :new_challenges_count => new_challenges_count,
        :new_challenges_indv_count => new_challenges_indv_count
      }
      Business::MerchantMailer.summary_newsletter_email(merchant,stats).deliver
    end
    now = Time.now
    logger.info("Merchant Summary Newsletters completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end