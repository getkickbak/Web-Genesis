config = YAML.load_file("#{Rails.root}/config/stripe.yml")[Rails.env]
Stripe.api_key = config["API_KEY"]