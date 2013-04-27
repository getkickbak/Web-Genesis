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
    puts "Complete migration"
  end
end