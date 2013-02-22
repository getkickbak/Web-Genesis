class TransferPoints
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::TranslationHelper
  include ApplicationHelper
  
  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/transfer_points_email.html.erb")
  @@simple_template = ERB.new File.read(File.expand_path "app/views/user_mailer/transfer_points_simple_email.html.erb")
  
  def initialize(sender, merchant, record)
    @sender = sender
    @merchant = merchant
    @record = record
  end
  
  def render_html
    @@template.result(binding)
  end
  
  def render_simple_html
    @@simple_template.result(binding)
  end
end