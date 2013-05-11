namespace :db do
  desc "Migration 2.1.1"
  task :migration_2_1_1 => :environment do |t, args|
    puts "Starting migration ..."
    merchants = Merchant.all(:status => :active, :role => "merchant")
    merchants.each do |merchant|
      if merchant.payment_subscription.nil?
        MerchantPaymentSubscription.create(merchant)
      end
    end
    puts "Complete migration"
  end
end