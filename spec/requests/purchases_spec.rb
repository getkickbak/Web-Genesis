require 'spec_helper'

describe "Purchases" do
  describe "POST /api/v1/purchase_rewards/earn" do
    it "should have given out correct reward and prize points" do
      post '/api/v1/tokens', :email => "test.user1@getkickbak.com", :password => "getkickbak", :start => 0, :limit => 100, :format => :json
      result = JSON.parse(response.body)
      auth_token = result["metaData"]["auth_token"]
      venue = Venue.get(1)
      for i in 1..100
        post '/api/v1/purchase_rewards/earn', :venue_id => venue.id, :auth_token => auth_token, :format => :json
        result = JSON.parse(response.body)
        result["success"].should == true
      end
      total_purchase = EarnRewardRecord.sum(:amount, :type => :purchase, EarnRewardRecord.merchant.id => venue.merchant.id)
      total_reward_points = EarnRewardRecord.sum(:points, :type => :purchase, EarnRewardRecord.merchant.id => venue.merchant.id)
      total_prize_points = EarnPrizeRecord.sum(:points, EarnPrizeRecord.merchant.id => venue.merchant.id)
      reward_model = venue.merchant.reward_model
      rebate_rate = (total_reward_points * reward_model.rebate_rate / 100 / total_purchase * 100).to_i
      prize_rebate_rate = (total_prize_points * reward_model.prize_rebate_rate / 100 / total_purchase * 100 / 2).to_i
      puts "Total Purchase: #{total_purchase}"
      puts "Total Reward Points: #{total_reward_points}"
      puts "Total Prize Points: #{total_prize_points}"
      puts "Model Rebate Rate: #{reward_model.rebate_rate}"
      puts "Model Prize Rebate Rate: #{reward_model.prize_rebate_rate}"
      puts "Actual Rebate Rate: #{rebate_rate}"
      puts "Actual Prize Rebate Rate: #{prize_rebate_rate}"
      true.should == true
    end
  end
end