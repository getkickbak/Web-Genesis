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
  
  def referral_email(user, venue, ref_email, ref_name)
    @user = user
    @venue = venue
    @ref_email = ref_email
    @ref_name = ref__name 
    mail(:to => ref_email, :subject => '#{user.name} thinks you should give {venue.name} a try...')  
  end
  
  def voucher_reminder_email(user, coupons)
    @user = user
    @coupons = coupons
    mail(:to => user.email, :subject => "Reminder - Use your vouchers before they expire!")
  end
  
  def transfer_points_email(sender, recipient_email, record, code)
    @sender = sender
    @recipient_email = recipient_email
    @record = record
    @qr = RQRCode::QRCode.new(code)
    mail(:to => recipient_email, :subject => "Points Transfer")
  end
end
