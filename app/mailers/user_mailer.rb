require 'util/common'

class UserMailer < ActionMailer::Base
  default :from => "KICKBAK <notification@getkickbak.com>"
  
  def contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'help@getkickbak.com', :subject => @contact.topic)
  end
  
  def add_merchant_contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'add_business@getkickbak.com', :subject => 'Business Inquiry')
  end
  
  def voucher_reminder_email(user, coupons)
    @user = user
    @coupons = coupons
    mail(:to => user.email, :subject => "Reminder - Use your vouchers before they expire!")
  end
end
