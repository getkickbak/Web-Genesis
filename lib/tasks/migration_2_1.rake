namespace :db do
  desc "Migration 2.1"
  task :migration_2_1 => :environment do |t, args|
    puts "Starting migration ..."
    challenge_type = ChallengeType.get(6)
    merchants = Merchant.all
    merchants.each do |merchant|
      reward_points = 1
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.facebook.name"),
        :description => (I18n.t "challenge.type.facebook.description"),
        :require_verif => false,
        :reward_amount => 0.00,
        :points => reward_points
      },
      merchant.venues)
    end
    pp1 = PaymentPlan.create(
      :name => "Plan - Small",
      :description => "Up to an average of 100 members/store.",
      :avg_member_count => 100,
      :price_wifi => 79.00,
      :price_internet => 89.00
    )
    pp2 = PaymentPlan.create(
      :name => "Plan - Medium",
      :description => "Up to an average of 300 members/store.",
      :avg_member_count => 300,
      :price_wifi => 119.00,
      :price_internet => 135.00
    )
    pp3 = PaymentPlan.create(
      :name => "Plan - Large",
      :description => "Up to an average of 600 members/store.",
      :avg_member_count => 600,
      :price_wifi => 169.00,
      :price_internet => 185.00
    )
    pp4 = PaymentPlan.create(
      :name => "Plan - XLarge",
      :description => "Up to an average of 1000 members/store.",
      :avg_member_count => 1000,
      :price_wifi => 229.00,
      :price_internet => 245.00
    )
    pp5 = PaymentPlan.create(
      :name => "Plan - 2K",
      :description => "Up to an average of 2000 members/store.",
      :avg_member_count => 2000,
      :price_wifi => 350.00
    )
    pp6 = PaymentPlan.create(
      :name => "Plan - 5K",
      :description => "Up to an average of 5000 members/store.",
      :avg_member_count => 5000,
      :price_wifi => 700.00
    )
    pp7 = PaymentPlan.create(
      :name => "Plan - 10K",
      :description => "Up to an average of 10000 members/store.",
      :avg_member_count => 10000,
      :price_wifi => 1050.00
    )
    pp8 = PaymentPlan.create(
      :name => "Plan - 25K",
      :description => "Up to an average of 25000 members/store.",
      :avg_member_count => 25000,
      :price_wifi => 2100.00
    )
    pp9 = PaymentPlan.create(
      :name => "Plan - 50K",
      :description => "Up to an average of 50000 members/store.",
      :avg_member_count => 50000,
      :price_wifi => 3500.00
    )
    puts "Complete migration"
  end
end