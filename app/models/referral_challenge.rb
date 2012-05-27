class ReferralChallenge
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::TranslationHelper
  include ActionView::Helpers::UrlHelper
  include ApplicationHelper
  include Rails.application.routes.url_helpers
  
  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/referral_challenge_email.html.erb")
  
  def initialize(sender, merchant, challenge)
    @sender = sender
    @merchant = merchant
    @challenge = challenge
  end
  
  def render_html
    @@template.result(binding)
  end  
end