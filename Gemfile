source 'http://rubygems.org'

RAILS_VERSION = '~> 3.2.0'
DM_VERSION    = '~> 1.2.0'

gem 'activesupport',      RAILS_VERSION, :require => 'active_support'
gem 'actionpack',         RAILS_VERSION, :require => 'action_pack'
gem 'actionmailer',       RAILS_VERSION, :require => 'action_mailer'
gem 'railties',           RAILS_VERSION, :require => 'rails'

gem 'dm-rails',           DM_VERSION

# You can use any of the other available database adapters.
# This is only a small excerpt of the list of all available adapters
# Have a look at
#
#  http://wiki.github.com/datamapper/dm-core/adapters
#  http://wiki.github.com/datamapper/dm-core/community-plugins
#
# for a rather complete list of available datamapper adapters and plugins

# gem 'dm-postgres-adapter',  DM_VERSION
# gem 'dm-oracle-adapter',    DM_VERSION
# gem 'dm-sqlserver-adapter', DM_VERSION

gem "rake",               '~> 0.9.2.2'
gem 'dm-core',              DM_VERSION
gem 'dm-serializer',        DM_VERSION
gem 'dm-migrations',        DM_VERSION
gem 'dm-types',             DM_VERSION
gem 'dm-validations',       DM_VERSION
#gem 'dm-validations', :git => 'git://github.com/emmanuel/dm-validations', :branch => 'feature/reorganize'
gem 'dm-constraints',       DM_VERSION
gem 'dm-transactions',      DM_VERSION
gem 'dm-aggregates',        DM_VERSION
gem 'dm-timestamps',        DM_VERSION
gem 'dm-observer',          DM_VERSION
gem 'dm-accepts_nested_attributes', DM_VERSION, :git => 'git://github.com/waelchatila/dm-accepts_nested_attributes'
gem 'dm-devise',            '~> 2.0.1'
gem 'cancan'
gem 'simple_form', '~> 2.0.2'
gem 'jquery-rails'  
gem 'rqrcode_png', '~> 0.1.1'
gem 'pdfkit'
gem 'barby', '~> 0.5.0'
gem 'wkhtmltopdf-binary'
gem 'tabs_on_rails'
gem 'redis'
gem 'resque'
gem 'resque-scheduler'
gem 'aws-s3'
gem 'uuidtools'
gem 'bcrypt-ruby'
gem 'country-select'
gem 'will_paginate'
gem 'websnap'
gem 'dalli'
gem 'fog'
gem 'mini_magick'
gem 'carrierwave'
gem 'carrierwave-datamapper', :require => 'carrierwave/datamapper'
gem 'faker'
gem 'rabl'
gem 'activemerchant', :require => 'active_merchant', :git => 'git@github.com:justformyfriends/active_merchant'
gem 'gibberish'
gem 'faye'

group(:development, :test) do
  gem 'dm-sqlite-adapter', DM_VERSION
  gem 'ruby-debug19'
  # Uncomment this if you want to use rspec for testing your application

  gem 'rspec-rails', '~> 2.6.1'

  # To get a detailed overview about what queries get issued and how long they take
  # have a look at rails_metrics. Once you bundled it, you can run
  #
  #   rails g rails_metrics Metric
  #   rake db:automigrate
  #
  # to generate a model that stores the metrics. You can access them by visiting
  #
  #   /rails_metrics
  #
  # in your rails application.

  # gem 'rails_metrics', '~> 0.1', :git => 'git://github.com/engineyard/rails_metrics'
  
  #gem 'ruby-debug'
end

group(:production) do  
  #gem "mysql2", :git => 'git://github.com/brianmario/mysql2'
  gem "mysql2"
  #gem 'ruby-debug19'
  gem 'dm-mysql-adapter', DM_VERSION
end

