hash = YAML.load(File.new(File.expand_path("config/database.yml", Rails.root)))
DataMapper.setup(:default, hash[Rails.env])
I18n.load_path += Dir[Rails.root.join('config', 'locales', '*.{rb,yml}').to_s]

exists = DataMapper.repository(:default).adapter.storage_exists?('merchant_types')
if exists
  merchant_types = MerchantType.all
  merchant_type_id_to_value = {}
  merchant_type_values = {}
  merchant_type_value_to_name = {}
  merchant_type_id_to_type = {}
  merchant_types.each do |type|
    merchant_type_id_to_type[type.id] = type
    merchant_type_id_to_value[type.id] = type.value
    I18n.available_locales.each do |locale|
      name = I18n.t "merchant.type.#{type.value}", :locale => locale
      if !merchant_type_values.include? locale
        merchant_type_values[locale] = []
      end
      merchant_type_values[locale] << [name, type.id]
      if !merchant_type_value_to_name.include? type.value
        merchant_type_value_to_name[type.value] = {}
      end
      merchant_type_value_to_name[type.value][locale] = name
    end
  end
  reward_model_types = RewardModelType.all
  reward_model_type_values = {}
  reward_model_type_id_to_value = {}
  reward_model_type_id_to_type = {}
  reward_model_type_value_to_name = {}
  reward_model_type_value_to_type = {}
  reward_model_types.each do |type|
    reward_model_type_id_to_type[type.id] = type
    reward_model_type_id_to_value[type.id] = type.value
    reward_model_type_value_to_type[type.value] = type
    I18n.available_locales.each do |locale|
      name = I18n.t "reward_model.type.#{type.value}", :locale => locale
      if !reward_model_type_values.include? locale
        reward_model_type_values[locale] = []
      end
      reward_model_type_values[locale] << [name, type.id]
      if !reward_model_type_value_to_name.include? type.value
        reward_model_type_value_to_name[type.value] = {}
      end
      reward_model_type_value_to_name[type.value][locale] = name
    end
  end
  venue_types = VenueType.all
  venue_type_values = {}
  venue_type_value_to_name = {}
  venue_type_id_to_type = {}
  venue_types.each do |type|
    venue_type_id_to_type[type.id] = type
    merchant_type_value = merchant_type_id_to_value[type.merchant_type_id]
    if !venue_type_values.include? merchant_type_value
      venue_type_values[merchant_type_value] = {}
    end
    if !venue_type_value_to_name.include? type.value
      venue_type_value_to_name[type.value] = {}
    end
    I18n.available_locales.each do |locale|
      name = I18n.t "venue.type.#{type.value}", :locale => locale
      if !venue_type_values[merchant_type_value].include? locale
        venue_type_values[merchant_type_value][locale] = []
      end
      venue_type_values[merchant_type_value][locale] << [name, type.id]
      venue_type_value_to_name[type.value][locale] = name
    end
  end
  customer_reward_types = CustomerRewardType.all
  customer_reward_type_values = {}
  customer_reward_type_value_to_name = {}
  customer_reward_type_id_to_type = {}
  customer_reward_types.each do |type|
    customer_reward_type_id_to_type[type.id] = type
    merchant_type_value = merchant_type_id_to_value[type.merchant_type_id]
    if !customer_reward_type_values.include? merchant_type_value
      customer_reward_type_values[merchant_type_value] = {}
    end
    if !customer_reward_type_value_to_name.include? type.value
      customer_reward_type_value_to_name[type.value] = {}
    end
    I18n.available_locales.each do |locale|
      name = I18n.t "customer_reward.type.#{type.value}", :locale => locale
      if !customer_reward_type_values[merchant_type_value].include? locale
        customer_reward_type_values[merchant_type_value][locale] = []
      end
      customer_reward_type_values[merchant_type_value][locale] << [name, type.id]
      customer_reward_type_value_to_name[type.value][locale] = name
    end
  end
  customer_reward_subtypes = CustomerRewardSubtype.all
  customer_reward_subtype_values = {}
  customer_reward_subtype_value_to_name = {}
  customer_reward_subtype_id_to_type = {}
  customer_reward_subtypes.each do |subtype|
    customer_reward_subtype_id_to_type[subtype.id] = subtype
    merchant_type_value = merchant_type_id_to_value[subtype.merchant_type_id]
    if !customer_reward_subtype_values.include? merchant_type_value
      customer_reward_subtype_values[merchant_type_value] = {}
    end
    if !customer_reward_subtype_values[merchant_type_value].include? subtype.value
      customer_reward_subtype_values[merchant_type_value][subtype.value] = {}
    end
    if !customer_reward_subtype_value_to_name.include? subtype.value
      customer_reward_subtype_value_to_name[subtype.value] = {}
    end
    I18n.available_locales.each do |locale|
      name = I18n.t "customer_reward.subtype.#{subtype.value}", :locale => locale
      if !customer_reward_subtype_values[merchant_type_value].include? locale
        customer_reward_subtype_values[merchant_type_value][subtype.value][locale] = []
      end
      customer_reward_subtype_values[merchant_type_value][subtype.value][locale] << [name, subtype.id]
      customer_reward_subtype_value_to_name[subtype.value][locale] = name
    end
  end
  challenge_types = ChallengeType.all
  merchant_challenge_types = MerchantChallengeType.all
  challenge_type_values = {}
  challenge_type_id_to_type = {}
  challenge_type_id_to_value = {}
  challenge_type_value_to_id = {}
  challenge_type_value_to_name = {}
  challenge_types.each do |type|
    challenge_type_id_to_type[type.id] = type
  end
  merchant_challenge_types.each do |type|
    challenge_type = challenge_type_id_to_type[type.challenge_type_id]
    merchant_type_value = merchant_type_id_to_value[type.merchant_type_id]
    if !challenge_type_values.include? merchant_type_value
      challenge_type_values[merchant_type_value] = {}
    end
    if !challenge_type_value_to_name.include? challenge_type.value
      challenge_type_value_to_name[challenge_type.value] = {}
    end
    challenge_type_id_to_value[challenge_type.id] = challenge_type.value
    challenge_type_value_to_id[challenge_type.value] = challenge_type.id
    I18n.available_locales.each do |locale|
      name = I18n.t "challenge.type.#{challenge_type.value}.name", :locale => locale
      if !challenge_type_values[merchant_type_value].include? locale
        challenge_type_values[merchant_type_value][locale] = []
      end
      challenge_type_values[merchant_type_value][locale] << [name, challenge_type.id]
      challenge_type_value_to_name[challenge_type.value][locale] = name
    end
  end
  badge_types = BadgeType.all
  badge_type_values = {}
  badge_type_value_to_name = {}
  badge_type_id_to_type = {}
  badge_types.each do |type|
    badge_type_id_to_type[type.id] = type
    merchant_type_value = merchant_type_id_to_value[type.merchant_type_id]
    if !badge_type_values.include? merchant_type_value
      badge_type_values[merchant_type_value] = {}
    end
    if !badge_type_values[merchant_type_value].include? type.value
      badge_type_values[merchant_type_value][type.value] = {}
    end
    if !badge_type_value_to_name.include? type.value
      badge_type_value_to_name[type.value] = {}
    end
    I18n.available_locales.each do |locale|
      name = I18n.t "badge.type.#{type.value}", :locale => locale
      if !badge_type_values[merchant_type_value].include? locale
        badge_type_values[merchant_type_value][locale] = []
      end
      badge_type_values[merchant_type_value][locale] << [name, type.id]
      badge_type_value_to_name[type.value][locale] = name
    end
  end
  visit_frequency_types = VisitFrequencyType.all
  visit_frequency_type_values = {}
  visit_frequency_type_value_to_name = {}
  visit_frequency_type_id_to_type = {}
  visit_frequency_types.each do |type|
    visit_frequency_type_id_to_type[type.id] = type
    if !visit_frequency_type_value_to_name.include? type.value
      visit_frequency_type_value_to_name[type.value] = {}
    end
    I18n.available_locales.each do |locale|
      name = I18n.t "visit_frequency.#{type.value}", :locale => locale
      if !visit_frequency_type_values.include? locale
        visit_frequency_type_values[locale] = []
      end
      visit_frequency_type_values[locale] << [name, type.id]
      visit_frequency_type_value_to_name[type.value][locale] = name
    end
  end
  badge_type_visits = {}
  badge_type_settings = BadgeTypeSetting.all
  badge_type_settings.each do |setting|
    visit_frequency_type = visit_frequency_type_id_to_type[setting.visit_frequency_type_id]
    if !badge_type_visits.include? visit_frequency_type.value
      badge_type_visits[visit_frequency_type.value] = {}
    end
    badge_type_visits[visit_frequency_type.value][badge_type_id_to_type[setting.badge_type_id].value] = setting.visits  
  end
  MerchantType.values = merchant_type_values
  MerchantType.value_to_name = merchant_type_value_to_name
  MerchantType.id_to_type = merchant_type_id_to_type
  RewardModelType.values = reward_model_type_values
  RewardModelType.id_to_value = reward_model_type_id_to_value
  RewardModelType.value_to_name = reward_model_type_value_to_name
  RewardModelType.id_to_type = reward_model_type_id_to_type
  RewardModelType.value_to_type = reward_model_type_value_to_type
  VenueType.values = venue_type_values
  VenueType.value_to_name = venue_type_value_to_name
  VenueType.id_to_type = venue_type_id_to_type
  CustomerRewardType.values = customer_reward_type_values
  CustomerRewardType.value_to_name = customer_reward_type_value_to_name
  CustomerRewardType.id_to_type = customer_reward_type_id_to_type
  CustomerRewardSubtype.values = customer_reward_subtype_values
  CustomerRewardSubtype.value_to_name = customer_reward_subtype_value_to_name
  CustomerRewardSubtype.id_to_type = customer_reward_subtype_id_to_type
  ChallengeType.values = challenge_type_values
  ChallengeType.id_to_value = challenge_type_id_to_value
  ChallengeType.value_to_id = challenge_type_value_to_id
  ChallengeType.value_to_name = challenge_type_value_to_name
  ChallengeType.id_to_type = challenge_type_id_to_type
  BadgeType.values = badge_type_values
  BadgeType.value_to_name = badge_type_value_to_name
  BadgeType.id_to_type = badge_type_id_to_type
  BadgeType.visits = badge_type_visits
  VisitFrequencyType.values = visit_frequency_type_values
  VisitFrequencyType.value_to_name = visit_frequency_type_value_to_name
  VisitFrequencyType.id_to_type = visit_frequency_type_id_to_type
end