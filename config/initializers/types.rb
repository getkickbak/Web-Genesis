hash = YAML.load(File.new(File.expand_path("config/database.yml", Rails.root)))
DataMapper.setup(:default, hash[Rails.env])
I18n.load_path += Dir[Rails.root.join('config', 'locales', '*.{rb,yml}').to_s]

merchant_types = MerchantType.all
merchant_type_id_to_value = {}
merchant_type_values = {}
merchant_type_value_to_name = {}
merchant_types.each do |type|
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
venue_types = VenueType.all
venue_type_values = {}
venue_type_value_to_name = {}
venue_types.each do |type|
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
purchase_reward_types = PurchaseRewardType.all
purchase_reward_type_values = {}
purchase_reward_type_value_to_name = {}
purchase_reward_types.each do |type|
  merchant_type_value = merchant_type_id_to_value[type.merchant_type_id]
  if !purchase_reward_type_values.include? merchant_type_value
    purchase_reward_type_values[merchant_type_value] = {}
  end
  if !purchase_reward_type_value_to_name.include? type.value
    purchase_reward_type_value_to_name[type.value] = {}
  end
  I18n.available_locales.each do |locale|
    name = I18n.t "purchase_reward.type.#{type.value}", :locale => locale
    if !purchase_reward_type_values[merchant_type_value].include? locale
      purchase_reward_type_values[merchant_type_value][locale] = []
    end
    purchase_reward_type_values[merchant_type_value][locale] << [name, type.id]
    purchase_reward_type_value_to_name[type.value][locale] = name
  end
end
customer_reward_types = CustomerRewardType.all
customer_reward_type_values = {}
customer_reward_type_value_to_name = {}
customer_reward_types.each do |type|
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
challenge_types = ChallengeType.all
merchant_challenge_types = MerchantChallengeType.all
challenge_type_values = {}
challenge_type_id_to_type = {}
challenge_type_id_to_value = {}
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
  I18n.available_locales.each do |locale|
    name = I18n.t "challenge.type.#{challenge_type.value}.name", :locale => locale
    if !challenge_type_values[merchant_type_value].include? locale
      challenge_type_values[merchant_type_value][locale] = []
    end
    challenge_type_values[merchant_type_value][locale] << [name, challenge_type.id]
    challenge_type_value_to_name[challenge_type.value][locale] = name
  end
end
MerchantType.values = merchant_type_values
MerchantType.value_to_name = merchant_type_value_to_name
VenueType.values = venue_type_values
VenueType.value_to_name = venue_type_value_to_name
PurchaseRewardType.values = purchase_reward_type_values
PurchaseRewardType.value_to_name = purchase_reward_type_value_to_name
CustomerRewardType.values = customer_reward_type_values
CustomerRewardType.value_to_name = customer_reward_type_value_to_name
ChallengeType.values = challenge_type_values
ChallengeType.id_to_value = challenge_type_id_to_value
ChallengeType.value_to_name = challenge_type_value_to_name