namespace :db do
  desc "Initialize demo data"
  task :demo_data, [:merchant_id] => :environment do |t, args|
    require 'faker'

    Time.zone = "Eastern Time (US & Canada)"
    now = Time.now
    puts "Creating Users..."
    merchant = Merchant.get(args[:merchant_id].to_i)
    users = []
    n = 0
    today = Date.today
    twelve_months_ago = today >> -12
    twelve_months_ago.upto(today) do |date|
      user = User.create(
        :name => Faker::Name.name,
        :email => Faker::Internet.email,
        :phone => "999#{(n + 100).to_s}#{(n + 1000).to_s}",
        :password => "getkickbak",
        :password_confirmation => "getkickbak",
        :role => "test",
        :status => :active
      )
      users << user
      auth_code = "#{String.random_alphanumeric}-#{merchant.id}-#{user.id}"
      customer = Customer.new
      customer[:auth_code] = auth_code
      customer[:badge_reset_ts] = date
      customer[:created_ts] = date
      customer[:update_ts] = date
      badges = merchant.badges.sort_by { |b| b.rank }
      customer.badge = badges.first
      customer.merchant = merchant
      customer.user = user
      customer.save
      n += 1
    end

    venues = merchant.venues
    challenges = Challenge.all(:merchant => merchant)
    rewards = CustomerReward.all(:merchant => merchant)
    reward_model = merchant.reward_model
    transactions = 1
    redeem_transactions = 1
    twelve_months_ago.upto(today) do |date|
      puts "Setting up data for date: #{date}"
      user = users[rand(users.length)]
      customer = Customer.first(Customer.merchant.id => merchant.id, Customer.user.id => user.id)
      transactions.times do |i|
      customer.visits += 1
        customer.next_badge_visits += 1
        challenge = challenges[rand(challenges.length)]
        challenge_record = EarnRewardRecord.new(
          :type => :challenge,
          :ref_id => challenge.id,
          :venue_id => venues[rand(venues.length)].id,
          :data => String.random_alphanumeric(32),
          :data_expiry_ts => date,
          :points => challenge.points,
          :created_ts => date,
          :update_ts => date
        )
        challenge_record.merchant = merchant
        challenge_record.customer = customer
        challenge_record.user = user
        challenge_record.save
        trans_record = TransactionRecord.new(
          :type => :earn_points,
          :ref_id => challenge_record.id,
          :description => challenge.name,
          :points => challenge.points,
          :created_ts => date,
          :update_ts => date
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save
        if customer.visits == 1
          signup_record = EarnRewardRecord.new(
            :type => :signup,
            :venue_id => venues[rand(venues.length)].id,
            :points => reward_model.signup_points,
            :created_ts => date,
            :update_ts => date
          )
          signup_record.merchant = merchant
          signup_record.customer = customer
          signup_record.user = user
          signup_record.save
          trans_record = TransactionRecord.new(
            :type => :signup_points,
            :ref_id => signup_record.id,
            :description => I18n.t("transaction.signup"),
            :points => reward_model.signup_points,
            :created_ts => date,
            :update_ts => date
          )
          trans_record.merchant = merchant
          trans_record.customer = customer
          trans_record.user = user
          trans_record.save
          customer.points += reward_model.signup_points
        end
        amount = rand(30) + 10.00
        purchase_record = EarnRewardRecord.new(
          :type => :purchase,
          :venue_id => venues[rand(venues.length)].id,
          :data => String.random_alphanumeric(32),
          :data_expiry_ts => now,
          :points => (amount / reward_model.price_per_point).to_i,
          :amount => amount,
          :created_ts => date,
          :update_ts => date
        )
        purchase_record.merchant = merchant
        purchase_record.customer = customer
        purchase_record.user = user
        purchase_record.save

        trans_record = TransactionRecord.new(
          :type => :earn_points,
          :ref_id => purchase_record.id,
          :description => (I18n.t "transaction.earn"),
          :points => purchase_record.points,
          :created_ts => date,
          :update_ts => date
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save

        reward_model.avg_spend = (reward_model.avg_spend * reward_model.total_visits + amount) / (reward_model.total_visits + 1)
        reward_model.total_visits += 1
        reward_model.save
        prize_record = EarnPrizeRecord.new(
          :type => :game,
          :venue_id => venues[rand(venues.length)].id,
          :points => (amount / reward_model.price_per_prize_point).to_i,
          :created_ts => date,
          :update_ts => date
        )
        prize_record.merchant = merchant
        prize_record.customer = customer
        prize_record.user = user
        prize_record.save
        trans_record = TransactionRecord.new(
          :type => :earn_prize_points,
          :ref_id => prize_record.id,
          :description => (I18n.t "transaction.earn"),
          :points => prize_record.points,
          :created_ts => date,
          :update_ts => date
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save
        customer.points += (purchase_record.points + challenge_record.points)
        customer.prize_points += prize_record.points
        customer.eligible_for_reward = true
        customer.eligible_for_prize = true
        customer.save
      end
      transactions = rand(20) + 1
      redeem_transactions.times do |i|
        reward = rewards[rand(rewards.length)]
        record = RedeemRewardRecord.new(
          :reward_id => reward.id,
          :venue_id => venues[rand(venues.length)].id,
          :points => reward.points,
          :mode => reward.mode,
          :created_ts => date,
          :update_ts => date
        )
        record.merchant = merchant
        record.customer = customer
        record.user = user
        record.save
        trans_record = TransactionRecord.new(
          :type => reward.mode == :reward ? :redeem_reward : :redeem_prize,
          :ref_id => record.id,
          :description => reward.title,
          :points => -reward.points,
          :created_ts => date,
          :update_ts => date
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save
        if reward.mode == :reward
          customer.points -= reward.points
        else
          customer.prize_points -= reward.points
        end
      end
      redeem_transactions = rand(2)
    end
  end
end