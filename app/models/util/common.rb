class Common
  def self.generate_full_merchant_qr_code_image_file_path(merchant_id, filename)
    get_file_host+generate_merchant_qr_code_image_file_path(merchant_id, filename)
  end

  def self.generate_merchant_qr_code_image_file_path(merchant_id, filename)
    "merchants/#{merchant_id}/qr_code_image/#{filename}"
  end

  def self.generate_full_merchant_qr_code_file_path(merchant_id, filename)
    get_file_host+generate_merchant_qr_code_file_path(merchant_id, filename)
  end

  def self.generate_merchant_qr_code_file_path(merchant_id, filename)
    "merchants/#{merchant_id}/qr_code/#{filename}"
  end

  def self.generate_full_voucher_file_path(user_id, filename)
    get_file_host+generate_voucher_file_path(user_id, filename)
  end

  def self.generate_voucher_file_path(user_id, filename)
    "users/#{user_id}/vouchers/#{filename}"
  end

  def self.generate_merchant_file_path(merchant_id, filename)
    "merchants/#{merchant_id}/#{filename}"
  end
  
  def self.generate_full_merchant_file_path(merchant_id, filename)
    get_file_host+generate_merchant_file_path(merchant_id, filename)
  end
  
  def self.generate_merchant_photo_file_path(merchant_id, filename)
    "merchants/#{merchant_id}/#{filename}"
  end

  def self.generate_full_merchant_photo_file_path(merchant_id, filename)
    get_photo_host+generate_merchant_photo_file_path(merchant_id, filename)
  end

  def self.generate_temp_file_path(filename)
    "temp/#{filename}"
  end

  def self.generate_full_temp_file_path(filename)
    get_photo_host+generate_temp_file_path(filename)
  end

  def self.get_reward_icon_file_path(merchant_type, reward_type_value, user_agent, resolution)
    get_file_host+"v1/icons/#{merchant_type}items/#{user_agent}/#{resolution}/#{reward_type_value}.png"  
  end
  
  def self.get_challenge_icon_file_path(challenge_type_value, user_agent, resolution)
    get_file_host+"v1/icons/mainicons/#{user_agent}/#{resolution}/#{challenge_type_value}.png" 
  end
  
  def self.within_geo_distance?(user, latitude_1, longitude_1, latitude_2, longitude_2)
    if !APP_PROP["SIMULATOR_MODE"] && user.role == "user"
      cal_distance = 6371000 * Math.acos( Math.cos( Math.radians( latitude_1 ) ) * Math.cos( Math.radians( latitude_2 ) ) * Math.cos( Math.radians( longitude_2 ) - Math.radians( longitude_1 ) ) + Math.sin( Math.radians( latitude_1 ) ) * Math.sin( Math.radians( latitude_2 ) ) )
      Rails.logger.info("Check geo-distance: #{cal_distance}m away")
      #return cal_distance <= 100
    end
    return true
  end

  def self.get_user_agent(user_agent)
    case user_agent
    when /iPhone/
      agent = :iphone
    when /Android/
      agent = :android
    else
      agent = :iphone  
    end  
  end
  
  def self.get_thumbail_resolution(agent, device_pixel_ratio)
    case agent
    when :iphone
      if device_pixel_ratio == 1 || device_pixel_ratio == 2
        return :mxhdpi
      end
    when :android
      if device_pixel_ratio < 1 || (device_pixel_ratio > 1 && device_pixel_ratio < 2)
        return :lhdpi
      elsif device_pixel_ratio == 1 || device_pixel_ratio == 2
        return :mxhdpi
      end
    end
  end
  
  def self.register_user_device(user, device_info)
    device = UserDevice.first(:user => user)
    if device.nil?
      device = UserDevice.create(user, device_info)
    else
      device.update_all(device_info)
    end
    return device
  end

  def self.get_rewards_by_venue(venue, mode)
    customer_reward_venues = CustomerRewardVenue.all(:fields => [:customer_reward_id], :venue_id => venue.id)
    customer_reward_ids = []
    customer_reward_venues.each do |reward_venue|
      customer_reward_ids << reward_venue.customer_reward_id
    end
    rewards = CustomerReward.all(:id => customer_reward_ids, :mode => mode, :order => [:points.asc])
    reward_id_to_subtype_id = {}
    reward_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward_id => customer_reward_ids)
    reward_to_subtypes.each do |reward_to_subtype|
      reward_id_to_subtype_id[reward_to_subtype.customer_reward_id] = reward_to_subtype.customer_reward_subtype_id
    end
    rewards.each do |reward|
      reward.eager_load_type = CustomerRewardSubtype.id_to_type[reward_id_to_subtype_id[reward.id]]
    end
    return rewards
  end
  
  def self.get_rewards_by_merchant(merchant)
    customer_reward_ids = []
    rewards = CustomerReward.all(:merchant => merchant, :order => [:points.asc])
    rewards.each do |reward|
      customer_reward_ids << reward.id
    end
    reward_id_to_subtype_id = {}
    reward_to_subtypes = CustomerRewardToSubtype.all(:fields => [:customer_reward_id, :customer_reward_subtype_id], :customer_reward_id => customer_reward_ids)
    reward_to_subtypes.each do |reward_to_subtype|
      reward_id_to_subtype_id[reward_to_subtype.customer_reward_id] = reward_to_subtype.customer_reward_subtype_id
    end
    rewards.each do |reward|
      reward.eager_load_type = CustomerRewardSubtype.id_to_type[reward_id_to_subtype_id[reward.id]]
    end
    return rewards
  end

  def self.get_challenges_by_merchant(merchant)
    challenge_ids = []
    challenges = Challenge.all(:merchant => merchant)
    challenges.each do |challenge|
      challenge_ids << challenge.id
    end
    challenge_id_to_type_id = {}
    challenge_to_types = ChallengeToType.all(:fields => [:challenge_id, :challenge_type_id], :challenge_id => challenge_ids)
    challenge_to_types.each do |challenge_to_type|
      challenge_id_to_type_id[challenge_to_type.challenge_id] = challenge_to_type.challenge_type_id
    end
    challenges.each do |challenge|
      challenge.eager_load_type = ChallengeType.id_to_type[challenge_id_to_type_id[challenge.id]]
    end  
    return challenges
  end
  
  def self.find_next_badge(badges, badge)
    idx = badges.bsearch_upper_boundary {|x| x.rank <=> badge.rank}
    idx = (idx > (badges.length - 1) ? badges.length - 1 : idx)
    badges[idx]
  end

  def self.find_badge(badges, visits)
    total_visits = 0
    next_badge_visits = visits
    found_badge = badges.first
    badges.each do |badge|
      total_visits += badge.visits
      if total_visits > visits
        next_badge_visits = visits - (total_visits - badge.visits)
        break
      else
        found_badge = badge  
        next_badge_visits = visits - total_visits
      end
    end
    return found_badge, next_badge_visits
  end
  
  def self.find_eligible_reward(rewards, points)
    idx = rewards.bsearch_lower_boundary {|x| x.points <=> points}
    idx = (idx > (rewards.length - 1) ? rewards.length - 1 : idx)
    reward = rewards[idx]
    if points < reward.points
      reward = (idx > 0) ? rewards[idx-1] : nil
    end
    return reward
  end

  def self.populate_badge(badge, user_agent, resolution)
    if badge.custom
      badge_type_image = MerchantBadgeTypeImage.first(:merchant_badge_type_id => badge.custom_type.id)
      badge_type = badge.custom_type
    else
      badge_type_image = BadgeTypeImage.first(:badge_type_id => badge.type.id) 
      badge_type = badge.type 
    end
    
    badge_type.thumbnail_small_url = "#{get_file_host}#{BadgeTypeImage.thumbnail_url_path[user_agent][resolution][:small]}/#{badge_type_image.thumbnail_url}"
    badge_type.thumbnail_medium_url = "#{get_file_host}#{BadgeTypeImage.thumbnail_url_path[user_agent][resolution][:medium]}/#{badge_type_image.thumbnail_url}"
    badge_type.thumbnail_large_url = "#{get_file_host}#{BadgeTypeImage.thumbnail_url_path[user_agent][resolution][:large]}/#{badge_type_image.thumbnail_url}"
  end
  
  def self.populate_badges(merchant, user_agent, resolution)
    badges = merchant.badges
    badge_ids = []
    badges.each do |badge|
      badge_ids << badge.id
    end
    badge_id_to_type_id = {}
    badge_type_ids = []
    badge_type_id_to_type = {}
    if merchant.custom_badges
      badge_to_types = BadgeToMerchantType.all(:fields => [:badge_id, :merchant_badge_type_id], :badge_id => badge_ids)
      badge_to_types.each do |badge_to_type|
        badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.merchant_badge_type_id
        badge_type_ids << badge_to_type.merchant_badge_type_id
      end
      badge_types = MerchantBadgeType.all(:id => badge_type_ids)
    else
      badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
      badge_to_types.each do |badge_to_type|
        badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
        badge_type_ids << badge_to_type.badge_type_id
      end
      badge_types = BadgeType.all(:id => badge_type_ids)
    end
    badge_types.each do |badge_type|
      badge_type_id_to_type[badge_type.id] = badge_type
    end
    badges.each do |badge|
      badge.eager_load_type = badge_type_id_to_type[badge_id_to_type_id[badge.id]]
    end
    populate_badge_type_images(merchant.custom_badges, user_agent, resolution, badge_type_ids, badge_type_id_to_type)
    merchant.badges.sort_by { |b| b.rank }
  end

  def self.populate_badge_type_images(custom_badges, user_agent, resolution, type_ids, badge_type_id_to_type)
    if custom_badges
      badge_type_images = MerchantBadgeTypeImage.all(:merchant_badge_type_id => type_ids)
    else
      badge_type_images = BadgeTypeImage.all(:badge_type_id => type_ids)
    end
    badge_type_images.each do |badge_type_image|
      if custom_badges
        # To do
        #badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_small_url = generate_full_merchant_file_path(merchant.id, "#{MerchantBadgeTypeImage.thumbnail_url_path[user_agent][resolution][:small]}/#{badge_type_image.thumbnail_url}")
        #badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_medium_url = generate_full_merchant_file_path(merchant.id, "#{MerchantBadgeTypeImage.thumbnail_url_path[user_agent][resolution][:medium]}/#{badge_type_image.thumbnail_url}")
        #badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_large_url = generate_full_merchant_file_path(merchant.id, "#{MerchantBadgeTypeImage.thumbnail_url_path[user_agent][resolution][:large]}/#{badge_type_image.thumbnail_url}")
      else
        small_url = "#{get_file_host}#{BadgeTypeImage.thumbnail_url_path[user_agent][resolution][:small]}/#{badge_type_image.thumbnail_url}"
        medium_url = "#{get_file_host}#{BadgeTypeImage.thumbnail_url_path[user_agent][resolution][:medium]}/#{badge_type_image.thumbnail_url}"
        large_url = "#{get_file_host}#{BadgeTypeImage.thumbnail_url_path[user_agent][resolution][:large]}/#{badge_type_image.thumbnail_url}"
        badge_type_id_to_type[badge_type_image.badge_type_id].url = large_url
        badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_small_url = small_url
        badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_medium_url = medium_url
        badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_large_url = large_url
      end
    end
  end
  
  def self.get_news(venue)
    newsfeed = []
    today = Date.today
    promotions = Promotion.all(:merchant => venue.merchant, :start_date.lte => today, :end_date.gte => today, :order => [:start_date.desc,:created_ts.desc])
    promotions.each do |promotion|
      newsfeed << News.new(
        {
          :type => "",
          :item_id => 0,
          :item_type => "",
          :title => promotion.subject,
          :photo => promotion.photo,
          :text => promotion.message,
          :created_date => promotion.start_date.strftime('%Y/%m/%d') 
        }
      )
    end
    return newsfeed
  end

  def self.connect_to_facebook(user, posts)
    success_posts = 0
    if (user.facebook_share_settings.checkins || user.facebook_share_settings.badge_promotions || user.facebook_share_settings.rewards) && user.facebook_auth
      oauth = Koala::Facebook::OAuth.new(APP_PROP["FACEBOOK_APP_ID"], APP_PROP["FACEBOOK_APP_SECRET"])
      graph = Koala::Facebook::API.new(oauth.get_app_access_token)
      has_permission = false
      visible_to_friends = false
      permissions = graph.get_connections(user.facebook_auth.uid, "permissions")
      if permissions.length == 0
        error_info = {
          "type" => "OAuthException", 
          "code" => "190", 
          "error_subcode" => "458", 
          "message" => "Internal Raised Exception"
        }
        raise Koala::Facebook::APIError.new(400, nil, error_info)
      end
      if permissions[0]["publish_actions"]
        has_permission = true
      end
      user_graph = Koala::Facebook::API.new(user.facebook_auth.token)
      privacy = user_graph.fql_query("SELECT value FROM privacy_setting WHERE name = 'default_stream_privacy'")
      if privacy[0]["value"] != "SELF" && privacy[0]["value"] != "NO_FRIENDS"
        visible_to_friends = true
      end
      #Rails.logger.info("Privacy Setting: #{privacy}")
      #Rails.logger.info("has_permission: #{has_permission}, visible_to_friends: #{visible_to_friends}")
      if has_permission && visible_to_friends
        results = graph.batch do |batch_api|
          for i in 0..posts.length-1
            post = posts[i]
            if post[:type] == "earn_points" && user.facebook_share_settings.checkins
              batch_api.put_wall_post(
                post[:message], 
                {
                  :place => post[:page_id]
                },
                user.facebook_auth.uid
              )
            elsif (post[:type] == "redeem" && user.facebook_share_settings.rewards) || (post[:type] == "badge_promotion" && user.facebook_share_settings.badge_promotions)
              batch_api.put_wall_post(
                post[:message], 
                {
                  :picture => post[:picture], :name => post[:link_name], :link => post[:link], :caption => post[:caption], :description => post[:description]
                },
                user.facebook_auth.uid
              )
            end
          end
        end
        for x in 0..results.length-1
          if results[x].is_a? Koala::Facebook::ClientError
            Rails.logger.error("Facebook post type(#{posts[x][:type]}), error: #{results[x].message}")
          else
            success_posts += 1  
          end
        end
      end
    end
    return success_posts
  end 
    
  private

  def self.get_photo_host_bucket
    "#{APP_PROP["AMAZON_PHOTOS_BUCKET"]}"
  end

  def self.get_photo_host
    "http://#{APP_PROP["PHOTO_HOST"]}/"
  end

  def self.get_file_host
    "http://#{APP_PROP["FILE_HOST"]}/"
  end
end