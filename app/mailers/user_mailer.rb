require 'util/common'

class UserMailer < ActionMailer::Base
  default :from => "KICKBAK <mail@getkickbak.com>"
  
  def contact_email(contact)
    @contact = contact
    mail(:to => 'help@getkickbak.com', :subject => @contact.topic)
  end
  
  def add_merchant_contact_email(contact)
    @contact = contact
    mail(:to => 'add_business@getkickbak.com', :subject => 'Business Inquiry')
  end

  def points_expiration_reminder_email(user, records)
    @user = user
    @records = records
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_points_expiration"))
  end
  
  def prize_expiration_reminder_email(user, prizes)
    @user = user
    @prizes = prizes
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_prize_expiration"))
  end
      
  def voucher_expiration_reminder_email(user, coupons)
    @user = user
    @coupons = coupons
    mail(:to => user.email, :subject => "Reminder - Use your vouchers before they expire!")
  end

  def referral_challenge_confirm_email(referrer, referral, venue, record)
    @referrer = referrer
    @referral = referral
    @venue = venue
    @record = record
    mail(:to => referrer.email, :subject => I18n.t("mailer.email_subject_confirm_referral_challenge"))
  end
  
  def transfer_points_confirm_email(sender, recipient, merchant, record)
    @sender = sender
    @recipient = recipient
    @merchant = merchant
    @record = record
    mail(:to => sender.email, :subject => I18n.t("mailer.email_subject_confirm_points_transfer"))
  end
  
  def welcome_email(user, password)
    @user = user
    @password = password
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_welcome"))
  end
  
  def activate_tag_email(user)
    @user = user
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_activate_tag"))  
  end
  
  def reset_password_email(user, new_password)
    @user = user
    @new_password = new_password
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_reset_password"))
  end
end
