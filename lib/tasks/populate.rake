namespace :db do
  desc "Initialize test data"
  task :populate => :environment do
    require 'faker'

    now = Time.now
    puts "Creating Users..."
    users = []
    10.times do |n|
      user = User.create(
      :name => Faker::Name.name,
      :email => Faker::Internet.email,
      :password => "getkickbak",
      :password_confirmation => "getkickbak",
      :role => "user",
      :status => :active
      )
      users << user
    end
    puts "Complete User creation"
  
    puts "Creating Staffs..."
    2.times do |n|
      staff = Staff.create(
      :name => Faker::Name.name,
      :email => Faker::Internet.email,
      :password => "getkickbak",
      :password_confirmation => "getkickbak",
      :role => "admin",
      :status => :active
      )
    end
    puts "Complete Staff creation"
    
    puts "Creating Merchants..."
    merchant_names = ["Cavacchio","Mario's Fine Dinning","Angelo's Pizza","Dynasty","Little Jerusalem","Korean House","Namasaki","Clinton's Bar and Grill","NataRajh","Quesadilla"]
    merchant_names.length.times do |n|
      type = MerchantType.get(1)
      merchant = Merchant.create(type,
      {
        :name => merchant_names[n],
        :email => Faker::Internet.email,
        :password => "getkickbak",
        :password_confirmation => "getkickbak",
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
      thumb_filenames = ["thumbnail_ios_small_thai.jpg","thumbnail_ios_small_chicken.jpg","thumbnail_ios_small_burrito.jpg","thumbnail_ios_small_salad.jpg","thumbnail_ios_small_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_ios_medium_thai.jpg","thumbnail_ios_medium_chicken.jpg","thumbnail_ios_medium_burrito.jpg","thumbnail_ios_medium_salad.jpg","thumbnail_ios_medium_focaccia.jpg"]
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
          :name => merchant.name,
          :address => Faker::Address.street_address,
          :city => Faker::Address.city,
          :state => Faker::Address.us_state_abbr,
          :zipcode => Faker::Address.zip_code,
          :country => "Canada",
          :phone => Faker::PhoneNumber.phone_number,
          :website => "http://www.sample.com",
          :latitude => 43.649546,
          :longitude => -79.376982
        })
        venues << venue
      end
      users.each do |user|
        customer = Customer.create(merchant,user)
        customer.points = rand(30)
        customer.save
        venues.each do |venue|
          CheckIn.create(venue, user, customer)
        end  
      end
      purchase_rewards = []
      reward_names = ["Entree","Appetizer","Drinks","Dessert","Soup","Bread","Salad","Noodles","Side Dish","Sandwich"]
      reward_names.length.times do |n|
        reward_type = PurchaseRewardType.get(rand(11)+1)
        reward = PurchaseReward.create(merchant,reward_type,
        {
          :title => reward_names[reward_names.length],
          :price => rand(10) + 10.75,
          :rebate_rate => 9,
          :points => rand(10) + 10
        },
        venues)
        purchase_rewards << reward
      end
      reward_names.length.times do |n|
        reward_type = CustomerRewardType.get(rand(11)+1)
        reward = CustomerReward.create(merchant,reward_type,
        {
          :title => reward_names[rand(reward_names.length)],
          :price => rand(10) + 10.75,
          :points => rand(10) + 80
        },
        venues)
        earn_prize = EarnPrize.new(
          :points => reward.points,
          :expiry_date => 6.month.from_now,
          :created_ts => now
        )
        earn_prize.reward = reward
        earn_prize.merchant = merchant
        earn_prize.user = users[n]
        earn_prize.save
      end
      challenges = []
      challenge_type = ChallengeType.get(1)
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.birthday.name"),
        :description => (I18n.t "challenge.type.birthday.description"),
        :require_verif => true,
        :points => rand(10) + 10
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(2)
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.menu.name"),
        :description => (I18n.t "challenge.type.menu.description"),
        :require_verif => true,
        :points => rand(10) + 10
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(3)
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.photo.name"),
        :description => (I18n.t "challenge.type.photo.description"),
        :require_verif => false,
        :points => rand(10) + 10
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(4)
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.referral.name"),
        :description => (I18n.t "challenge.type.referral.description"),
        :require_verif => false,
        :points => rand(10) + 10
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(5)
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.vip.name"),
        :description => (I18n.t "challenge.type.vip.description"),
        :data => ActiveSupport::HashWithIndifferentAccess.new(:visits => 24),
        :require_verif => false,
        :points => rand(10) + 10
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(6)
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.custom.name"),
        :description => (I18n.t "challenge.type.custom.description"),
        :require_verif => true,
        :points => rand(10) + 10
      },
      venues)
      challenges << challenge
      10.times do |n|
        record = EarnRewardRecord.new(
          :challenge_id => challenges[rand(6)].id,
          :venue_id => venues[rand(2)].id,
          :points => challenges[rand(6)].points,
          :created_ts => now
        )
        record.merchant = merchant
        record.user = users[n]
        record.save
        record = EarnRewardRecord.new(
          :reward_id => purchase_rewards[n].id,
          :venue_id => venues[rand(2)].id,
          :points => purchase_rewards[n].points,
          :created_ts => now
        )
        record.merchant = merchant
        record.user = users[n]
        record.save
      end        
    end
    puts "Complete Merchant creation"
  end
end