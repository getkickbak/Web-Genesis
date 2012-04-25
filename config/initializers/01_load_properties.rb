Rails.logger.instance_variable_get(:@logger).instance_variable_get(:@log_dest).sync = true if Rails.logger
APP_PROP = YAML.load_file("#{Rails.root}/config/properties.yml")[Rails.env]