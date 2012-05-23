class TransferPoints
  include ActionView::Helpers::TextHelper
  include ApplicationHelper
  
  @@template = ERB.new File.read(File.expand_path "app/views/user_mailer/transfer_points_email.html.erb")
  
  def initialize(sender, record)
    @sender = sender
    @record = record
  end
  
  def render_html
    @@template.result(binding)
  end  
end