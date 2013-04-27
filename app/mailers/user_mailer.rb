require 'util/common'

class UserMailer < ActionMailer::Base
  default :from => "KICKBAK <mail@getkickbak.com>"
  
  def contact_email(contact)
    @contact = contact
    mail(:to => 'help@getkickbak.com', :subject => @contact.topic)
  end
  
  def add_merchant_contact_email(contact)
    @contact = contact
    mail(:to => 'add_business@getkickbak.com', :subject => 'mailer.email_subject_business_inquiry')
  end

  def points_expiration_reminder_email(user, records)
    @user = user
    @records = records
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_points_expiration"))
  end
  
  def promotion_email(user, promotion)
    @user = user
    @promotion = promotion
    mail(:to => user.email, :subject => "#{promotion.merchant.name} - #{promotion.subject}")
  end
  
  def facebook_token_expired_email(user)
    @user = user
    mail(:to => user.email, :subject => I18n.t("mailer.email_subject_facebook_token_expired"))
  end
end
