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

  def self.generate_merchant_photo_file_path(merchant_id, filename)
    "merchants/#{merchant_id}/#{filename}"
  end

  def self.generate_full_merchant_photo_file_path(merchant_id,filename)
    get_photo_host+generate_merchant_photo_file_path(merchant_id, filename)
  end

  def self.generate_temp_file_path(filename)
    "temp/#{filename}"
  end

  def self.generate_full_temp_file_path(filename)
    get_photo_host+generate_temp_file_path(filename)
  end

  def self.within_geo_distance?(user, latitude_1, longitude_1, latitude_2, longitude_2)
    if !APP_PROP["SIMULATOR_MODE"] && user.role == "user"
      cal_distance = 6371000 * Math.acos( Math.cos( Math.radians( latitude_1 ) ) * Math.cos( Math.radians( latitude_2 ) ) * Math.cos( Math.radians( longitude_2 ) - Math.radians( longitude_1 ) ) + Math.sin( Math.radians( latitude_1 ) ) * Math.sin( Math.radians( latitude_2 ) ) )
      Rails.logger.info("Check geo-distance: #{cal_distance}m away")
      #return cal_distance <= 100
    end
    return true
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

  def self.get_rewards(venue, mode)
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

  def self.populate_badges(merchant, user_agent)
    badges = merchant.badges
    if merchant.custom_badges
      badge_types = []
      badges.each do |badge|
        badge_types << badge.custom_type
      end
    else
      badge_ids = []
      badges.each do |badge|
        badge_ids << badge.id
      end
      badge_id_to_type_id = {}
      badge_to_types = BadgeToType.all(:fields => [:badge_id, :badge_type_id], :badge_id => badge_ids)
      badge_to_types.each do |badge_to_type|
        badge_id_to_type_id[badge_to_type.badge_id] = badge_to_type.badge_type_id
      end
      badge_types = []
      badges.each do |badge|
        badge.eager_load_type = BadgeType.id_to_type[badge_id_to_type_id[badge.id]]
        badge_types << badge.eager_load_type
      end
    end
    populate_badge_type_images(user_agent, merchant.custom_badges, badge_types)
    merchant.badges.sort_by { |b| b.rank }
  end

  def self.populate_badge_type_images(user_agent, custom_badges, badge_types)
    type_ids = []
    badge_type_id_to_type = {}
    badge_types.each do |badge_type|
      type_ids << badge_type.id
      badge_type_id_to_type[badge_type.id] = badge_type
    end
    case user_agent
    when /iPhone/
      agent = :iphone
    when /Android/
      agent = :android
    else
      agent = :iphone
    end
    if custom_badges
      badge_type_images = MerchantBadgeTypeImage.all(:merchant_badge_type_id => type_ids, :user_agent => agent)
    else
      badge_type_images = BadgeTypeImage.all(:badge_type_id => type_ids, :user_agent => agent)
    end
    Rails.logger.info("Badge Type Images: #{badge_type_images}")
    badge_type_images.each do |badge_type_image|
      badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_small_url = badge_type_image.thumbnail_small_url
      badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_medium_url = badge_type_image.thumbnail_medium_url
      badge_type_id_to_type[badge_type_image.badge_type_id].thumbnail_large_url = badge_type_image.thumbnail_large_url
    end
    Rails.logger.info("Badge Types: #{badge_types}")
  end

  def self.get_news(venue)
    newsfeed = []
    promotions = Promotion.all(:merchant => venue.merchant)
    promotions.each do |promotion|
      newsfeed << News.new(
      "",
      0,
      "",
      "",
      promotion.message
      )
    end
    return newsfeed
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