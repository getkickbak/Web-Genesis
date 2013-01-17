Genesis::Application.configure do
# Settings specified here will take precedence over those in config/application.rb

# In the development environment your application's code is reloaded on
# every request.  This slows down response time but is perfect for development
# since you don't have to restart the webserver when you make code changes.
  config.cache_classes = true

  # Log error messages when you accidentally call methods on nil.
  config.whiny_nils = true

  # Show full error reports and disable caching
  config.consider_all_requests_local       = false
  #config.action_view.debug_rjs             = true
  config.action_controller.perform_caching = true

  # Don't care if the mailer can't send
  # config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger
  config.active_support.deprecation = :log

  # Only use best-standards-support built into browsers
  config.action_dispatch.best_standards_support = :builtin

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

  #config.log_level = :info
  
  #config.cache_store = :dalli_store
  
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

