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
      reward_count = []
      challenge_count = []
      total_reward_count = EarnRewardRecord.count(:merchant => merchant, :reward_id.gt => 0, :created_ts => (beginning_of_last_week..end_of_last_week))
      total_challenge_count = EarnRewardRecord.count(:merchant => merchant, :challenge_id.gt => 0, :created_ts => (beginning_of_last_week..end_of_last_week))
      purchase_rewards = PurchaseReward.all(PurchaseReward.merchant.id => merchant.id)
      purchase_rewards.each do |reward|
        count = EarnRewardRecord.count(:reward_id => reward.id, :created_ts => (beginning_of_last_week..end_of_last_week))
        percentage = total_reward_count > 0 ? (count / Float(total_reward_count) * 100) : 0
        reward_count << {:name => reward.title, :count => count, :percentage => percentage}
      end
      challenges = Challenge.all(Challenge.merchant.id => merchant.id)
      challenges.each do |challenge|
        count = EarnRewardRecord.count(:challenge_id => challenge.id, :created_ts => (beginning_of_last_week..end_of_last_week))
        percentage = total_challenge_count > 0 ? (count / Float(total_challenge_count) * 100) : 0
        challenge_count << {:name => challenge.name, :count => count, :percentage => percentage}
      end
      stats = {
        :total_customer_count => total_customer_count,
        :new_customer_count => new_customer_count,
        :total_reward_count => total_reward_count,
        :total_challenge_count => total_challenge_count,
        :reward_count => reward_count,
        :challenge_count => challenge_count
      }
      Business::MerchantMailer.summary_newsletter_email(merchant,stats).deliver
    end
    logger.info("MerchantSummaryNewsletters completed successfully at #{now.strftime("%a %m/%d/%y %H:%M %Z")}")
  end
end