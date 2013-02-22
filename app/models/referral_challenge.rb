class ReferralChallenge
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::TranslationHelper
  include ApplicationHelper
  
  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/referral_challenge_email.html.erb")
  @@simple_template = ERB.new File.read(File.expand_path "app/views/user_mailer/referral_challenge_simple_email.html.erb")
  
  def initialize(sender, venue, challenge)
    @sender = sender
    @venue = venue
    @challenge = challenge
  end
  
  def render_html
    @@template.result(binding)
  end
  
  def render_simple_html
    @@simple_template.result(binding)
  end
end