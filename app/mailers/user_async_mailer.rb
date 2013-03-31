require 'util/common'

class UserAsyncMailer < ActionMailer::Base
  default :from => "KICKBAK <mail@getkickbak.com>"
  include Resque::Mailer
  
  def eligible_reward_email(customer_id, reward_id)
    @customer = Customer.get(customer_id)
    @eligible_reward = CustomerReward.get(reward_id)
    mail(:to => @customer.user.email, :subject => (I18n.t("mailer.email_subject_eligible_reward") % [@customer.merchant.name]))
  end
  
  def reward_notif_email(customer_id, reward_info)
    @customer = Customer.get(customer_id)
    @reward_info = JSON.parse(reward_info)
    Rails.logger.info("#{@reward_info}")
    mail(:to => @customer.user.email, :subject => (I18n.t("mailer.email_subject_reward_notif") % [@customer.merchant.name]))
  end
  
  def referral_challenge_confirm_email(referrer_id, referral_id, venue_id, record_id)
    @referrer = User.get(referrer_id)
    @referral = User.get(referral_id)
    @venue = Venue.get(venue_id)
    @record = ReferralChallengeRecord.get(record_id)
    mail(:to => @referrer.email, :subject => I18n.t("mailer.email_subject_confirm_referral_challenge"))
  end
  
  def transfer_points_confirm_email(sender_id, recipient_id, merchant_id, record_id)
    @sender = User.get(sender_id)
    @recipient = User.get(recipient_id)
    @merchant = Merchant.get(merchant_id)
    @record = TransferPointsRecord.get(record_id)
    mail(:to => @sender.email, :subject => I18n.t("mailer.email_subject_confirm_points_transfer"))
  end
  
  def reset_password_email(user_id, new_password)
    @user = User.get(user_id)
    @new_password = new_password
    mail(:to => @user.email, :subject => I18n.t("mailer.email_subject_reset_password"))
  end
end