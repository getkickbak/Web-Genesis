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
        :description => "Impressive in scope, marvelously detailed, laced with drama; the Cavacchio pays homage to a phenomenon shrouded in mystery. The experience at Cavacchio is sheer bliss. From the moment one enters, the design is relaxing and indulging. The mixture of eclectic Asian decor, mesmerizing music, and distinctive cuisine is the soul of this spot.",
        :address => "7 King St. E",
        :city => "Toronto",
        :state => "Ontario",
        :country => "Canada",
        :zipcode => "M5C 3C5",
        :phone => "(416) 849-1808",
        :website => "http://www.cavacchio.ca",
        :latitude => 43.649647,
        :longitude => -79.377036
      },
      {
        :name => "Mario's Fine Dinning",
        :description => "In the heart of Toronto's financial district, chef Greg Argent has created a menu that revisits favourite bistro classics while respectfully incorporating modern techniques and global influences. Whether visiting Forte for lunch, dinner, or cocktails and imaginative hors d'oeuvres, Mario's promises to be as comfortable and unpretentious as it is delicious.",
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
        :description => "At Angelo's Pizza, we strive to always bring you a little more. More delicious ways to discover great times and more smiles per minute. Honest home style cooking is our obsession that we can't help. We go out of our way to bring you tasty flavours and fresh dishes that keep you craving another bite at Angelo's Pizza.",
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
        :description => "Dynasty is located on the ground floor of The SoHo Metropolitan Hotel. The arrival of Vincent Leung as head of the kitchen marks a new phase in the development of Senses' cuisine. Chef Leung has long leveraged his ethnic Chinese heritage and classical French culinary training to create food best known for its East-meets-West signature style. However, his new Senses menu, which took a year to develop, promises more.",
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
        :description => "Little Jerusalem offers Continental cuisine with Italian and Mediterranean influences. Chef Mike Crockford, utilizes seasonal and local product whenever possible. We offer a magnificent wine list that spans the wine producing regions of the world, with outstanding matching wines by the glass to compliment the bright, precise flavours of our cuisine.",
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
        :description => " This unique cook-it-yourself concept provides for a delicious and entertaining dining experience. Dine with a few friends or dine with a large group! Our charming dining room, exquisite cuisine and top notch service will keep you coming back!",
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
        :description => "At Namasaki, chefs prepare dishes in both the open principal kitchen and at our sushi bar. Choose the environment and cuisine that suits your pleasure.  Dishes are meant to be shared, with a sensation of flavours brought steadily to the table throughout the meal. The experience flows and the enjoyment unfolds - a fresh take on the Japanese style of leisurely eating and drinking with friends.",
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
        :description => "Clinton's Bar and Grill is the exciting interactive dining experience that presents your meal cooking on a heated stone at your table. Clinton's unique method sears in all natural juices and nutrients, enhancing the full flavor and tenderness of your meal.",
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
        :description => "The menu includes appetizers like panir and Brie cheese croquettes in a savory crust of gram flour and lentil flakes and tangy chaat of rice cakes served with crispy spinach fritters, yoghurt and fresh date chutney. Main courses such as lobster tail coated with fresh red pepper paste, coconut, and baby spinach (cooked in a tandoor) are offered. Four-year-old aged basmati rice accompanies each dish.",
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
        :description => "Quesadilla is a Canadian-owned, fast-casual, California-style Burrito concept. We opened our first location in Toronto in 2007, with the idea of serving high quality, fresh, healthy \"new-age\" Mexican food, such as two-handed Burritos, Salads, Tacos and Quesadillas, all made to order.",
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
        :description => merchant_info[n][:description],
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
          :name => "#{merchant.name} #{i}",
          :description => merchant_info[n][:description],
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