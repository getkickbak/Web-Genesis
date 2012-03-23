namespace :db do
  desc "Initialize test data"
  task :populate => :environment do
    require 'faker'

    puts "Creating Users..."
    10.times do |n|
      user = User.create(
      :name => Faker::Name.name,
      :email => Faker::Internet.email,
      :password => "Gravispc",
      :password_confirmation => "Gravispc",
      :role => "user",
      :status => :active
      )
    end
    puts "Complete User creation"
  
    puts "Creating Staffs..."
    2.times do |n|
      staff = Staff.create(
      :name => Faker::Name.name,
      :email => Faker::Internet.email,
      :password => "Gravispc",
      :password_confirmation => "Gravispc",
      :role => "admin",
      :status => :active
      )
    end
    puts "Complete Staff creation"
    
    puts "Creating Merchants..."
    1.times do |n|
      type = MerchantType.get(1)
      merchant = Merchant.create(type,
      {
        :name => Faker::Name.name,
        :email => Faker::Internet.email,
        :password => "Gravispc",
        :password_confirmation => "Gravispc",
        :account_first_name => Faker::Name.name,
        :account_last_name => Faker::Name.name,
        :phone => Faker::PhoneNumber.phone_number,
        :status => :active,
        :prize_terms => I18n.t('prize.terms')
      })
      filenames = ["thai.jpg","chicken.jpg","burrito.jpg","salad.jpg","focaccia.jpg"]
      file_idx = rand(filenames.length)
      filename = filenames[file_idx] 
      AWS::S3::S3Object.copy(
        filename,
        "merchants/#{merchant.id}/#{filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_thai.jpg","thumbnail_chicken.jpg","thumbnail_burrito.jpg","thumbnail_salad.jpg","thumbnail_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      DataMapper.repository(:default).adapter.execute(
          "UPDATE merchants SET photo = ?, alt_photo = ? WHERE id = ?", filename, filename, merchant.id
      )
      RewardModel.create(merchant,
      {
        :rebate_rate => 9,
        :prize_rebate_rate => 5
      })
      venues = []
      2.times do |n|
        venue = Venue.create(merchant,type,
        {
          :name => Faker::Name.name,
          :address => Faker::Address.street_address,
          :city => Faker::Address.city,
          :state => Faker::Address.us_state_abbr,
          :zipcode => Faker::Address.zip_code,
          :country => "Canada",
          :phone => Faker::PhoneNumber.phone_number,
          :website => "www.sample.com",
          :latitude => 43.649546,
          :longitude => -79.376982
        })
        venues << venue
      end
      10.times do |n|
        reward_type = PurchaseRewardType.get(rand(11)+1)
        PurchaseReward.create(merchant,reward_type,
        {
          :title => Faker::Name.name,
          :price => rand(10) + 10.75,
          :rebate_rate => 9,
          :points => rand(10) + 10
        },
        venues)
      end
      10.times do |n|
        reward_type = CustomerRewardType.get(rand(11)+1)
        CustomerReward.create(merchant,reward_type,
        {
          :title => Faker::Name.name,
          :price => rand(10) + 10.75,
          :points => rand(10) + 80
        },
        venues)
      end
      challenge_type = ChallengeType.get(1)
      Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.birthday.name"),
        :description => (I18n.t "challenge.type.birthday.description"),
        :require_verif => true,
        :points => rand(10) + 10
      },
      venues)
      challenge_type = ChallengeType.get(2)
      Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.menu.name"),
        :description => (I18n.t "challenge.type.menu.description"),
        :require_verif => true,
        :points => rand(10) + 10
      },
      venues)
      challenge_type = ChallengeType.get(3)
      Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.photo.name"),
        :description => (I18n.t "challenge.type.photo.description"),
        :require_verif => false,
        :points => rand(10) + 10
      },
      venues)
      challenge_type = ChallengeType.get(4)
      Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.referral.name"),
        :description => (I18n.t "challenge.type.referral.description"),
        :require_verif => false,
        :points => rand(10) + 10
      },
      venues)
      challenge_type = ChallengeType.get(5)
      Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.vip.name"),
        :description => (I18n.t "challenge.type.vip.description"),
        :data => ActiveSupport::HashWithIndifferentAccess.new(:visits => 24),
        :require_verif => false,
        :points => rand(10) + 10
      },
      venues)
      challenge_type = ChallengeType.get(6)
      Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.custom.name"),
        :description => (I18n.t "challenge.type.custom.description"),
        :require_verif => true,
        :points => rand(10) + 10
      },
      venues)
    end
    puts "Complete Merchant creation"
  end
end