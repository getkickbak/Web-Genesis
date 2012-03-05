=begin
config = YAML.load_file("#{Rails.root}/config/braintree.yml")[Rails.env]
Braintree::Configuration.merchant_id = config["MERCHANT_ID"]
Braintree::Configuration.public_key = config["PUBLIC_KEY"]
Braintree::Configuration.private_key = config["PRIVATE_KEY"]
=end
