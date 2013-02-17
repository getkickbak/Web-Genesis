config = YAML.load_file("#{Rails.root}/config/braintree.yml")[Rails.env]
if Rails.env == "production"
  Braintree::Configuration.environment = :production
else
  Braintree::Configuration.environment = :sandbox
end
Braintree::Configuration.merchant_id = config["MERCHANT_ID"]
Braintree::Configuration.public_key = config["PUBLIC_KEY"]
Braintree::Configuration.private_key = config["PRIVATE_KEY"]