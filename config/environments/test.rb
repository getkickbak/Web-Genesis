Genesis::Application.configure do
# Settings specified here will take precedence over those in config/application.rb

# The test environment is used exclusively to run your application's
# test suite.  You never need to work with it otherwise.  Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs.  Don't rely on the data there!
  config.cache_classes = true

  # Log error messages when you accidentally call methods on nil.
  config.whiny_nils = true

  # Show full error reports and disable caching
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Raise exceptions instead of rendering exception templates
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment
  config.action_controller.allow_forgery_protection    = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  # config.action_mailer.delivery_method = :test

  # Use SQL instead of Active Record's schema dumper when creating the test database.
  # This is necessary if your schema can't be completely dumped by the schema dumper,
  # like if you have constraints or database-specific column types
  # config.active_record.schema_format = :sql

  # Print deprecation notices to the stderr
  config.active_support.deprecation = :stderr

  config.action_mailer.default_url_options = { :host => 'getkickbak.com' }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    :address              => "mail1",
    :port                 => 25,
    #:domain               => 'baci.lindsaar.net',
    #:user_name            => 'root',
    #:password             => 'micro',
    #:authentication       => :plain,
    :enable_starttls_auto => true
    #:openssl_verify_mode  => 'none'
  }
  PDFKit.configure do |config|
    config.wkhtmltopdf = '/usr/local/rvm/gems/ruby-1.9.2-p290/bin/wkhtmltopdf'
    config.default_options = {
      :encoding=>"UTF-8",
      :page_size=>"A4", #or "Letter" or whatever needed
      :margin_top=>"0.25in",
      :margin_right=>"0.25in",
      :margin_bottom=>"0.25in",
      :margin_left=>"0.25in",
      :disable_smart_shrinking=>false
    }
  end
  
  config.log_level = :info
  
  config.cache_store = :dalli_store
  
=begin  
  ActiveMerchant::Billing::Base.mode = :test
    ::BILLING_GATEWAY = ActiveMerchant::Billing::BeanstreamGateway.new(
    :login => '158670000',
    :user => 'guest',
    :password => 'test1234',
    :secure_profile_api_key => 'A5B59392C6304f7288b2d7793742a6a6'
    #:recurring_api_key => 'A5B59392C6304f7288b2d7793742a6a6'
  )
=end

  # This is where ImageMagicK is installed
  ENV['PATH'] = "/opt/local/bin:#{ENV['PATH']}"
end
