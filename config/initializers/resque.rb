ENV["REDISTOGO_URL"] ||= YAML.load_file("#{RAILS_ROOT}/config/properties.yml")[RAILS_ENV]["REDIS_URL"]
uri = URI.parse(ENV["REDISTOGO_URL"])

Resque.redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
require 'resque_scheduler'

Dir["#{Rails.root}/app/jobs/*.rb"].each { |file| require file }
  
Resque.schedule = YAML.load_file("#{Rails.root}/config/resque_schedule.yml")