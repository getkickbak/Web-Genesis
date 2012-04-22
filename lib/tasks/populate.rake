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
    merchant_info = [
      {
        :name => "Cavacchio",
        :address => "499 King St. W",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5V 1K4",
        :phone => "(416) 849-1808",
        :website => "http://www.cavacchio.ca",
        :latitude => 43.64547,
        :longitude => -79.396455
      },
      {
        :name => "Mario's Fine Dinning",
        :address => "640 Queen Street West",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M56 1E4",
        :phone => "(416) 703-3377",
        :website => "http://www.marios.ca",
        :latitude => 43.647224,
        :longitude => -79.406068
      },
      {
        :name => "Angelo's Pizza",
        :address => "2448 Bloor St. W",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M6S 1R2",
        :phone => "(416) 763-2222",
        :website => "http://www.angelospizza.ca",
        :latitude => 43.649274,
        :longitude => -79.485183
      },
      {
        :name => "Dynasty",
        :address => "1055 Yonge St.",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M4W 2L2",
        :phone => "(416) 551-9890",
        :website => "http://www.dynasty.ca",
        :latitude => 43.678705,
        :longitude => -79.38976
      },
      {
        :name => "Little Jerusalem",
        :address => "318 Wellington St.",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5V 3T4",
        :phone => "(416) 935-0400",
        :website => "http://www.littlejerusalem.ca",
        :latitude => 43.645159,
        :longitude => -79.391949
      },
      {
        :name => "Korean House",
        :address => "36 Wellington St. E",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5E 1C7",
        :phone => "(416) 504-9990",
        :website => "http://www.koreanhouse.ca",
        :latitude => 43.648824,
        :longitude => -79.375105
      },
      {
        :name => "Namasaki",
        :address => "504 Jarvis St.",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M4Y 2H6",
        :phone => "(647) 348-6520",
        :website => "http://www.namasaki.ca",
        :latitude => 43.66767,
        :longitude => -79.378903
      },
      {
        :name => "Clinton's Bar and Grill",
        :address => "9 Church St.",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5E 1M2",
        :phone => "(416) 504-9463",
        :website => "http://www.clintonsbarngrill.ca",
        :latitude => 43.648156,
        :longitude => -79.373517
      },
      {
        :name => "NataRajh",
        :address => "303 Augusta Avenue",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5T 2M2",
        :phone => "(647) 343-1932",
        :website => "http://www.nataRajh.ca",
        :latitude => 43.656975,
        :longitude => -79.402678
      },
      {
        :name => "Quesadilla",
        :address => "106 Front St. E",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5A 1E1",
        :phone => "(416) 363-8370",
        :website => "http://www.quesadilla.ca",
        :latitude => 43.650221,
        :longitude => -79.370642
      }
    ]
    merchant_info.length.times do |n|
      type = MerchantType.get(1)
      merchant = Merchant.create(type,
      {
        :name => merchant_info[n][:name],
        :email => Faker::Internet.email,
        :password => "getkickbak",
        :password_confirmation => "getkickbak",
        :account_first_name => Faker::Name.name,
        :account_last_name => Faker::Name.name,
        :phone => merchant_info[n][:phone],
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
      2.times do |i|
        venue = Venue.create(merchant,type,
        {
          :name => merchant.name,
          :address => merchant_info[n][:address],
          :city => merchant_info[n][:city],
          :state => merchant_info[n][:state],
          :zipcode => merchant_info[n][:zipcode],
          :country => merchant_info[n][:country],
          :phone => merchant_info[n][:phone],
          :website => merchant_info[n][:website],
          :latitude => merchant_info[n][:latitude],
          :longitude => merchant_info[n][:longitude]
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
      reward_names = {:entrees => "Entrees", :appetizers => "Appetizers", :drinks => "Drinks", :desserts => "Desserts", :soup => "Soup",
                      :bread => "Bread", :salad => "Salad", :noodles => "Noodles", :side_dishes => "Side Dishes", :sandwiches => "Sandwiches",
                      :pasta => "Pasta", :pastry => "Pastry"}
      reward_names_count = {:entrees => 0, :appetizers => 0, :drinks => 0, :desserts => 0, :soup => 0,
                      :bread => 0, :salad => 0, :noodles => 0, :side_dishes => 0, :sandwiches => 0,
                      :pasta => 0, :pastry => 0}                
      reward_names.length.times do |i|
        idx = rand(reward_names.length)+1
        reward_type = PurchaseRewardType.get(idx)
        reward = PurchaseReward.create(merchant,reward_type,
        {
          :title => "#{reward_names[reward_type.value.to_sym]} #{reward_names_count[reward_type.value.to_sym]+1}",
          :price => rand(10) + 10.75,
          :rebate_rate => 9,
          :points => rand(10) + 10
        },
        venues)
        purchase_rewards << reward
        reward_names_count[reward_type.value.to_sym] += 1
      end
      reward_names_count = {:entrees => 0, :appetizers => 0, :drinks => 0, :desserts => 0, :soup => 0,
                      :bread => 0, :salad => 0, :noodles => 0, :side_dishes => 0, :sandwiches => 0,
                      :pasta => 0, :pastry => 0}
      reward_names.length.times do |i|
        idx = rand(reward_names.length)+1
        reward_type = CustomerRewardType.get(idx)
        reward = CustomerReward.create(merchant,reward_type,
        {
          :title => "#{reward_names[reward_type.value.to_sym]} #{reward_names_count[reward_type.value.to_sym]+1}",
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
        earn_prize.user = users[rand(users.length)]
        earn_prize.save
        reward_names_count[reward_type.value.to_sym] += 1
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
      10.times do |i|
        challenge = challenges[rand(6)]
        record = EarnRewardRecord.new(
          :challenge_id => challenge.id,
          :venue_id => venues[rand(2)].id,
          :points => challenge.points,
          :created_ts => now
        )
        record.merchant = merchant
        record.user = users[rand(users.length)]
        record.save
        reward = purchase_rewards[rand(purchase_rewards.length)]
        record = EarnRewardRecord.new(
          :reward_id => reward.id,
          :venue_id => venues[rand(2)].id,
          :points => reward.points,
          :created_ts => now
        )
        record.merchant = merchant
        record.user = users[rand(users.length)]
        record.save
      end        
    end
    puts "Complete Merchant creation"
  end
end