class TransferPoints
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::TranslationHelper
  include ActionView::Helpers::UrlHelper
  include ApplicationHelper
  include Rails.application.routes.url_helpers
  
  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/transfer_points_email.html.erb")
  
  def initialize(sender, record)
    @sender = sender
    @record = record
  end
  
  def render_html
    @@template.result(binding)
  end  
end