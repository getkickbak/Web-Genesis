Genesis::Application.configure do
# Settings specified here will take precedence over those in config/application.rb
# The production environment is meant for finished, "live" apps.
# Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Specifies the header that your server uses for sending files
  # config.action_dispatch.x_sendfile_header = "X-Sendfile"

  # For nginx:
  config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect'

  # If you have no front-end server that supports something like X-Sendfile,
  # just comment this out and Rails will serve the files

  # See everything in the log (default is :info)
  config.log_level = :info

  # Use a different logger for distributed setups
  # config.logger = SyslogLogger.new

  # Use a different cache store in production
  # config.cache_store = :mem_cache_store

  # Disable Rails's static asset server
  # In production, Apache or nginx will already do this
  config.serve_static_assets = false

  # Enable serving of images, stylesheets, and javascripts from an asset server
  # config.action_controller.asset_host = "http://assets.example.com"

  # Disable delivery errors, bad email addresses will be ignored
  # config.action_mailer.raise_delivery_errors = false

  # Enable threaded mode
  # config.threadsafe!

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  config.action_mailer.default_url_options = { :host => 'getkickbak.com' }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    :address              => "email-smtp.us-east-1.amazonaws.com",
    :port                 => 587,
    :domain               => 'getkickbak.com',
    :user_name            => 'AKIAIQHTJ2545DNOIIPA',
    :password             => 'Anmu/wO/5gWkCg3uJFhRLIa2Wb2clpTctaq6ElcJsDLZ',
    :authentication       => :plain,
    :enable_starttls_auto => true
    #:openssl_verify_mode  => 'none'
  }
  PDFKit.configure do |config|
    config.wkhtmltopdf = '/data/JustForMyFriends/shared/bundled_gems/ruby/1.9.1/bin/wkhtmltopdf'
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
=begin
  ActiveMerchant::Billing::Base.mode = :production
  ::BILLING_GATEWAY = ActiveMerchant::Billing::BeanstreamGateway.new(
    :login => '158670000',
    :user => 'paymentprocessor',
    :password => 'GOL2YDgb7exMjD',
    :secure_profile_api_key => 'A5B59392C6304f7288b2d7793742a6a6',
    :recurring_api_key => 'A5B59392C6304f7288b2d7793742a6a6'
  )
=end  
end
