require 'resque_scheduler'
require 'resque_scheduler/server'

ENV["REDISTOGO_URL"] ||= YAML.load_file("#{Rails.root}/config/properties.yml")[Rails.env]["REDIS_URL"]
uri = URI.parse(ENV["REDISTOGO_URL"])

Resque.redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
  
Resque.schedule = YAML.load_file("#{Rails.root}/config/resque_schedule.yml")

Dir["#{Rails.root}/app/jobs/*.rb"].each { |file| require file }