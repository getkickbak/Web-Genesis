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
    @ref_name = ref_name 
    mail(:to => ref_email, :subject => '#{user.name} thinks you should give {venue.name} a try...')  
  end
  
  def voucher_reminder_email(user, coupons)
    @user = user
    @coupons = coupons
    mail(:to => user.email, :subject => "Reminder - Use your vouchers before they expire!")
  end
  
  def transfer_points_confirm_email(sender, recipient, merchant, record)
    @sender = sender
    @recipient = recipient
    @merchant = merchant
    @record = record
    logger.debug("Sending transfer points confirmation email: #{sender.email}")
    #mail(:to => sender.email, :subject => I18n.t("api.customers.email_subject_confirm_points_transfer"))
  end
end
