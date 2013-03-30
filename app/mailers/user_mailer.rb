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
  
  def transfer_points_confirm_email(sender, recipient, merchant, record)
    @sender = sender
    @recipient = recipient
    @merchant = merchant
    @record = record
    mail(:to => sender.email, :subject => I18n.t("mailer.email_subject_confirm_points_transfer"))
  end
  
  def reset_password_email(user, new_password)
    @user = user
    @new_password = new_password
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_reset_password"))
  end
  
  def promotion_email(user, promotion)
    @user = user
    @promotion = promotion
    mail(:to => user.email, :subject => "#{promotion.merchant.name} - #{promotion.subject}")
  end
end
