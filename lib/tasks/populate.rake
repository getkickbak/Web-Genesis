namespace :db do
  desc "Initialize test data"
  task :populate => :environment do
    require 'faker'

    Time.zone = "Eastern Time (US & Canada)"
    now = Time.now
    puts "Creating Users..."
    users = []
    user1 = User.create(
      :name => "John Smith",
      :email => "test.user1@getkickbak.com",
      :phone => "4169876543",
      :password => "getkickbak",
      :password_confirmation => "getkickbak",
      :role => "test",
      :status => :active
    )
    users << user1
    user2 = User.create(
      :name => "David Best",
      :email => "test.user2@getkickbak.com",
      :phone => "9059872134",
      :password => "getkickbak",
      :password_confirmation => "getkickbak",
      :role => "test",
      :status => :active
    )
    users << user2
    puts "Complete User creation"
  
    puts "Creating Staffs..."
    staff_info = [
      {
        :name => "Paul Chan",
        :email => "paul.chan@getkickbak.com"
      },
      {
        :name => "Eric Chan",
        :email => "eric.chan@getkickbak.com"
      }
    ]
    2.times do |n|
      staff = Staff.create(
      :name => staff_info[n][:name],
      :email => staff_info[n][:email],
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
        :state => "ON",
        :country => "CA",
        :zipcode => "M5C 3C5",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4168491808",
        :website => "http://www.cavacchio.ca",
        :latitude => 43.649647,
        :longitude => -79.377036
      },
      {
        :name => "Mario's Fine Dinning",
        :description => "In the heart of Toronto's financial district, chef Greg Argent has created a menu that revisits favourite bistro classics while respectfully incorporating modern techniques and global influences. Whether visiting Forte for lunch, dinner, or cocktails and imaginative hors d'oeuvres, Mario's promises to be as comfortable and unpretentious as it is delicious.",
        :address => "640 Queen Street West",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M56 1E4",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4167033377",
        :website => "http://www.marios.ca",
        :latitude => 43.647224,
        :longitude => -79.406068
      },
      {
        :name => "Angelo's Pizza",
        :description => "At Angelo's Pizza, we strive to always bring you a little more. More delicious ways to discover great times and more smiles per minute. Honest home style cooking is our obsession that we can't help. We go out of our way to bring you tasty flavours and fresh dishes that keep you craving another bite at Angelo's Pizza.",
        :address => "2448 Bloor St. W",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M6S 1R2",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4167632222",
        :website => "http://www.angelospizza.ca",
        :latitude => 43.649274,
        :longitude => -79.485183
      },
      {
        :name => "Dynasty",
        :description => "Dynasty is located on the ground floor of The SoHo Metropolitan Hotel. The arrival of Vincent Leung as head of the kitchen marks a new phase in the development of Senses' cuisine. Chef Leung has long leveraged his ethnic Chinese heritage and classical French culinary training to create food best known for its East-meets-West signature style. However, his new Senses menu, which took a year to develop, promises more.",
        :address => "1055 Yonge St.",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M4W 2L2",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4165519890",
        :website => "http://www.dynasty.ca",
        :latitude => 43.678705,
        :longitude => -79.38976
      },
      {
        :name => "Little Jerusalem",
        :description => "Little Jerusalem offers Continental cuisine with Italian and Mediterranean influences. Chef Mike Crockford, utilizes seasonal and local product whenever possible. We offer a magnificent wine list that spans the wine producing regions of the world, with outstanding matching wines by the glass to compliment the bright, precise flavours of our cuisine.",
        :address => "318 Wellington St.",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M5V 3T4",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4169350400",
        :website => "http://www.littlejerusalem.ca",
        :latitude => 43.645159,
        :longitude => -79.391949
      },
      {
        :name => "Korean House",
        :description => " This unique cook-it-yourself concept provides for a delicious and entertaining dining experience. Dine with a few friends or dine with a large group! Our charming dining room, exquisite cuisine and top notch service will keep you coming back!",
        :address => "36 Wellington St. E",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M5E 1C7",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4165049990",
        :website => "http://www.koreanhouse.ca",
        :latitude => 43.648824,
        :longitude => -79.375105
      },
      {
        :name => "Namasaki",
        :description => "At Namasaki, chefs prepare dishes in both the open principal kitchen and at our sushi bar. Choose the environment and cuisine that suits your pleasure.  Dishes are meant to be shared, with a sensation of flavours brought steadily to the table throughout the meal. The experience flows and the enjoyment unfolds - a fresh take on the Japanese style of leisurely eating and drinking with friends.",
        :address => "504 Jarvis St.",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M4Y 2H6",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "6473486520",
        :website => "http://www.namasaki.ca",
        :latitude => 43.66767,
        :longitude => -79.378903
      },
      {
        :name => "Clinton's Bar n Grill",
        :description => "Clinton's Bar n Grill is the exciting interactive dining experience that presents your meal cooking on a heated stone at your table.  Clinton's unique method sears in all natural juices and nutrients, enhancing the full flavor and tenderness of your meal.",
        :address => "9 Church St.",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M5E 1M2",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4165049463",
        :website => "http://www.clintonsbarngrill.ca",
        :latitude => 43.648156,
        :longitude => -79.373517
      },
      {
        :name => "NataRajh",
        :description => "The menu includes appetizers like panir and Brie cheese croquettes in a savory crust of gram flour and lentil flakes and tangy chaat of rice cakes served with crispy spinach fritters, yoghurt and fresh date chutney. Main courses such as lobster tail coated with fresh red pepper paste, coconut, and baby spinach (cooked in a tandoor) are offered. Four-year-old aged basmati rice accompanies each dish.",
        :address => "303 Augusta Avenue",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M5T 2M2",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "6473431932",
        :website => "http://www.nataRajh.ca",
        :latitude => 43.656975,
        :longitude => -79.402678
      },
      {
        :name => "Quesadilla",
        :description => "Quesadilla is a Canadian-owned, fast-casual, California-style Burrito concept. We opened our first location in Toronto in 2007, with the idea of serving high quality, fresh, healthy \"new-age\" Mexican food, such as two-handed Burritos, Salads, Tacos and Quesadillas, all made to order.",
        :address => "106 Front St. E",
        :city => "Toronto",
        :state => "ON",
        :country => "CA",
        :zipcode => "M5A 1E1",
        :time_zone => "Eastern Time (US & Canada)",
        :phone => "4163638370",
        :website => "http://www.quesadilla.ca",
        :latitude => 43.650221,
        :longitude => -79.370642
      }
    ]
    merchant_info.length.times do |n|
      type = MerchantType.get(1)
      visit_frequency_type = VisitFrequencyType.get(2)
      merchant = Merchant.create(type, visit_frequency_type,
      {
        :name => merchant_info[n][:name],
        :description => merchant_info[n][:description],
        :email => Faker::Internet.email,
        :password => "getkickbak",
        :password_confirmation => "getkickbak",
        :account_first_name => Faker::Name.name,
        :account_last_name => Faker::Name.name,
        :phone => merchant_info[n][:phone],
        :website => merchant_info[n][:website],
        :role => "test",
        :status => :active,
        :will_terminate => false,
        :custom_badges => false,
        :reward_terms => I18n.t('customer_reward.terms')
      })
      badges = []
      badge_types = BadgeType.all(:merchant_type_id => merchant.type.id)
      badge_types.each do |badge_type|
        badge = Badge.new(:custom => false, :visits => BadgeType.visits[merchant.visit_frequency.value][badge_type.value])
        badge.type = badge_type
        badge.save
        badges << badge
      end  
      merchant.badges.concat(badges)
      merchant.save
      puts "Finished creating Merchant(#{merchant.name})"
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
      thumb_filenames = ["thumbnail_ios_large_thai.jpg","thumbnail_ios_large_chicken.jpg","thumbnail_ios_large_burrito.jpg","thumbnail_ios_large_salad.jpg","thumbnail_ios_large_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_android_lhdpi_small_thai.jpg","thumbnail_android_lhdpi_small_chicken.jpg","thumbnail_android_lhdpi_small_burrito.jpg","thumbnail_android_lhdpi_small_salad.jpg","thumbnail_android_lhdpi_small_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_android_lhdpi_medium_thai.jpg","thumbnail_android_lhdpi_medium_chicken.jpg","thumbnail_android_lhdpi_medium_burrito.jpg","thumbnail_android_lhdpi_medium_salad.jpg","thumbnail_android_lhdpi_medium_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_android_lhdpi_large_thai.jpg","thumbnail_android_lhdpi_large_chicken.jpg","thumbnail_android_lhdpi_large_burrito.jpg","thumbnail_android_lhdpi_large_salad.jpg","thumbnail_android_lhdpi_large_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_android_mxhdpi_small_thai.jpg","thumbnail_android_mxhdpi_small_chicken.jpg","thumbnail_android_mxhdpi_small_burrito.jpg","thumbnail_android_mxhdpi_small_salad.jpg","thumbnail_android_mxhdpi_small_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_android_mxhdpi_medium_thai.jpg","thumbnail_android_mxhdpi_medium_chicken.jpg","thumbnail_android_mxhdpi_medium_burrito.jpg","thumbnail_android_mxhdpi_medium_salad.jpg","thumbnail_android_mxhdpi_medium_focaccia.jpg"]
      thumb_filename = thumb_filenames[file_idx] 
      AWS::S3::S3Object.copy(
        thumb_filename,
        "merchants/#{merchant.id}/#{thumb_filename}", 
        APP_PROP["AMAZON_PHOTOS_BUCKET"],
        :copy_acl => true
      )
      thumb_filenames = ["thumbnail_android_mxhdpi_large_thai.jpg","thumbnail_android_mxhdpi_large_chicken.jpg","thumbnail_android_mxhdpi_large_burrito.jpg","thumbnail_android_mxhdpi_large_salad.jpg","thumbnail_android_mxhdpi_large_focaccia.jpg"]
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
      type = RewardModelType.value_to_type["amount_spend"]
      RewardModel.create(merchant, type,
      {
        :signup_amount => 10.00,
        :signup_points => 10.00 / 10 * 100,
        :rebate_rate => 10,
        :prize_rebate_rate => 10,
        :expected_avg_spend => 20.00
      })
      venues = []
      2.times do |i|
        venue_type = VenueType.first(:value => "restaurant")
        venue = Venue.create(merchant,venue_type,
        {
          :name => "#{merchant.name} #{i}",
          :description => merchant_info[n][:description],
          :address => merchant_info[n][:address],
          :city => merchant_info[n][:city],
          :state => merchant_info[n][:state],
          :zipcode => merchant_info[n][:zipcode],
          :country => merchant_info[n][:country],
          :time_zone => merchant_info[n][:time_zone],
          :phone => merchant_info[n][:phone],
          :website => merchant_info[n][:website],
          :latitude => merchant_info[n][:latitude],
          :longitude => merchant_info[n][:longitude]
        })
        puts "Finished creating Venue(#{venue.name})"
        venues << venue
      end
      users.each do |user|
        customer = Customer.create(merchant,user)
        venues.each do |venue|
          CheckIn.create(venue, user, customer)
        end  
      end
      rewards = []
      reward_subtype_id = [19, 1, 14, 10, 34, 2, 33, 21, 30, 25, 22, 29, 35]
      reward_names = {:entree => "Entree", :appetizer => "Appetizer", :drink => "Drink", :dessert => "Dessert", :soup => "Soup", 
                      :bread => "Bread", :salad => "Salad", :noodles => "Noodles", :side_dish => "Side Dish", :sandwich => "Sandwich",
                      :pasta => "Pasta", :pastry => "Pastry", :custom => "Custom"}
      reward_names.length.times do |i|
        id = reward_subtype_id[i]
        reward_sub_type = CustomerRewardSubtype.get(id)
        price = rand(10) + 10.75
        points = (price / merchant.reward_model.price_per_point / merchant.reward_model.rebate_rate * 100).to_i
        reward = CustomerReward.create(merchant,reward_sub_type,
        {
          :title => "#{reward_names[reward_sub_type.value.to_sym]}",
          :price => price,
          :points => points,
          :mode => :reward,
          :quantity_limited => false,
          :quantity => 0,
          :time_limited => false,
          :expiry_date => Date.today.to_s
        },
        venues)
        rewards << reward
      end
      prizes = []
      prize_subtype_id = [19, 1, 14, 35]
      prize_names = {:entree => "Set Dinner For 2", :appetizer => "Special Appetizer", :drink => "Any 3 Free Drinks", :custom => "$20 OFF Over $40 Purchase"}
      prize_names.length.times do |i|
        id = prize_subtype_id[i]
        prize_sub_type = CustomerRewardSubtype.get(id)
        price = rand(10) + 10.75
        points = (price / merchant.reward_model.price_per_prize_point / merchant.reward_model.prize_rebate_rate * 100).to_i
        prize = CustomerReward.create(merchant,prize_sub_type,
        {
          :title => "#{prize_names[prize_sub_type.value.to_sym]}",
          :price => price,
          :points => points,
          :mode => :prize,
          :quantity_limited => true,
          :quantity => rand(10) + 10,
          :time_limited => true,
          :expiry_date => (Date.today >> 6).to_s
        },
        venues)
        prizes << prize
      end
      challenges = []
      challenge_type = ChallengeType.get(1)
      reward_amount = rand(10) + 10.00
      reward_points = (reward_amount / merchant.reward_model.price_per_prize_point / merchant.reward_model.rebate_rate * 100).to_i
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.birthday.name"),
        :description => (I18n.t "challenge.type.birthday.description"),
        :require_verif => true,
        :reward_amount => reward_amount,
        :points => reward_points
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(2)
      reward_amount = rand(10) + 10.00
      reward_points = (reward_amount / merchant.reward_model.price_per_prize_point / merchant.reward_model.rebate_rate * 100).to_i
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.menu.name"),
        :description => ((I18n.t "challenge.type.menu.description") % [(I18n.t "challenge.type.menu.name")]),
        :require_verif => true,
        :reward_amount => reward_amount,
        :points => reward_points
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(3)
      reward_amount = rand(10) + 10.00
      reward_points = (reward_amount / merchant.reward_model.price_per_prize_point / merchant.reward_model.rebate_rate * 100).to_i
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.photo.name"),
        :description => (I18n.t "challenge.type.photo.description"),
        :require_verif => false,
        :reward_amount => reward_amount,
        :points => reward_points
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(4)
      reward_amount = rand(10) + 10.00
      reward_points = (reward_amount / merchant.reward_model.price_per_prize_point / merchant.reward_model.rebate_rate * 100).to_i
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.referral.name"),
        :description => (I18n.t "challenge.type.referral.description"),
        :data => ActiveSupport::HashWithIndifferentAccess.new(:referral_reward_amount => reward_amount, :referral_points => reward_points),
        :require_verif => false,
        :reward_amount => reward_amount,
        :points => reward_points
      },
      venues)
      challenges << challenge
      challenge_type = ChallengeType.get(5)
      reward_amount = rand(10) + 10.00
      reward_points = (reward_amount / merchant.reward_model.price_per_prize_point / merchant.reward_model.rebate_rate * 100).to_i
      challenge = Challenge.create(merchant,challenge_type,
      {
        :name => (I18n.t "challenge.type.custom.name"),
        :description => (I18n.t "challenge.type.custom.description"),
        :require_verif => true,
        :reward_amount => reward_amount,
        :points => reward_points
      },
      venues)
      challenges << challenge
      4.times do |i|
        user = users[rand(users.length)]
        customer = Customer.first(Customer.merchant.id => merchant.id, Customer.user.id => user.id)
        customer.visits += 1
        customer.next_badge_visits += 1
        challenge = challenges[rand(5)]
        challenge_record = EarnRewardRecord.new(
          :type => :challenge,
          :ref_id => challenge.id,
          :venue_id => venues[rand(2)].id,
          :data => String.random_alphanumeric(32),
          :data_expiry_ts => now,
          :points => challenge.points,
          :created_ts => now,
          :update_ts => now
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
          :created_ts => now,
          :update_ts => now
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save
        if customer.visits == 1
          signup_record = EarnRewardRecord.new(
            :type => :signup,
            :venue_id => venues[rand(2)].id,
            :points => merchant.reward_model.signup_points,
            :created_ts => now,
            :update_ts => now
          )
          signup_record.merchant = merchant
          signup_record.customer = customer
          signup_record.user = user
          signup_record.save
          trans_record = TransactionRecord.new(
            :type => :signup_points,
            :ref_id => signup_record.id,
            :description => I18n.t("transaction.signup"),
            :points => merchant.reward_model.signup_points,
            :created_ts => now,
            :update_ts => now
          )
          trans_record.merchant = merchant
          trans_record.customer = customer
          trans_record.user = user
          trans_record.save
          customer.points += merchant.reward_model.signup_points
        end
        amount = rand(30) + 1.00
        purchase_record = EarnRewardRecord.new(
          :type => :purchase,
          :venue_id => venues[rand(2)].id,
          :data => String.random_alphanumeric(32),
          :data_expiry_ts => now,
          :points => (amount / merchant.reward_model.price_per_point).to_i,
          :amount => amount,
          :created_ts => now,
          :update_ts => now
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
          :created_ts => now,
          :update_ts => now
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save
        merchant.reward_model.avg_spend = (merchant.reward_model.avg_spend * merchant.reward_model.total_visits + amount) / (merchant.reward_model.total_visits + 1)
        merchant.reward_model.total_visits += 1
        merchant.reward_model.save
        prize_record = EarnPrizeRecord.new(
          :type => :game,
          :venue_id => venues[rand(2)].id,
          :points => (amount / merchant.reward_model.price_per_prize_point).to_i,
          :created_ts => now,
          :update_ts => now
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
          :created_ts => now,
          :update_ts => now
        )
        trans_record.merchant = merchant
        trans_record.customer = customer
        trans_record.user = user
        trans_record.save
        customer.points += (purchase_record.points + challenge_record.points)
        customer.prize_points += prize_record.points
        rewards = rewards.sort_by { |b| b.points }
        prizes = prizes.sort_by { |b| b.points }
        customer.eligible_for_reward = !Common.find_eligible_reward(rewards, customer.points).nil?
        customer.eligible_for_prize = !Common.find_eligible_reward(prizes, customer.prize_points).nil?
        customer.save
      end  
      10.times do |i|
        promotion = Promotion.create(merchant, 
        {
          :subject => "Hello",
          :message => "This is a test #{i}",
          :start_date => now.to_date.to_s,
          :end_date => now.to_date.to_s
        })
      end      
    end
    puts "Complete Merchant creation"
  end
end