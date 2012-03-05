require 'profile'

PayPalSDKProfiles::Profile.load_config(YAML.load_file("#{Rails.root}/config/paypal.yml")[Rails.env])