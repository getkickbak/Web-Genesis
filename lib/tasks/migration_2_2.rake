namespace :db do
  desc "Migration 2.2"
  task :migration_2_2 => :environment do |t, args|
    puts "Starting migration ..."
    merchants = Merchant.all(:status => :active)
    merchants.each do |merchant|
      if merchant.features_config.nil?
        MerchantFeaturesConfig.create(merchant)
        merchant.reload
      end
      merchant.venues.each do |venue|
        if venue.features_config.nil?
          VenueFeaturesConfig.create(venue, merchant.features_config)
        end
      end
    end
    puts "Complete migration"
  end
end