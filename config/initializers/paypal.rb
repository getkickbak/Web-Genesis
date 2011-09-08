require 'profile'

PayPalSDKProfiles::Profile.load_config(YAML.load_file("#{RAILS_ROOT}/config/paypal.yml")[RAILS_ENV])