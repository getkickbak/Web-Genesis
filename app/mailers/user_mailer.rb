require 'util/common'

class UserMailer < ActionMailer::Base
  default :from => "JustForMyFriends <notification@justformyfriends.com>"
  
  def order_confirmed_email(order, is_gift)
    @order = order
    @referral_id = Referral.get(order.referral_id).referral_id
    @is_gift = is_gift
    @subdeal = Subdeal.get(@order.subdeal_id)
    @order.coupons.each do |coupon|
      file = AWS::S3::S3Object.find(::Common.generate_voucher_file_path(@order.user,"#{coupon.coupon_id}.pdf"), APP_PROP["AMAZON_FILES_BUCKET"])
      attachments["#{coupon.coupon_id}.pdf"] = {:mime_type => 'application/pdf',
                                                :data => file.value}
    end
    mail(:to => @order.user.email, :subject => "Order Confirmation - " + @order.deal.title)
  end
  
  def reward_email(reward)
    @reward = reward
    file = AWS::S3::S3Object.find(::Common.generate_reward_file_path(@reward.user,"#{@reward.reward_code}.pdf"), APP_PROP["AMAZON_FILES_BUCKET"])
    attachments["#{@reward.reward_code}.pdf"] = {:mime_type => 'application/pdf',
                                              :data => file.value}      
    mail(:to => @reward.user.email, :subject => "Reward - A #{@reward.deal.reward_title}")
  end
  
  def contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'help@justformyfriends.com', :subject => @contact.topic)
  end
  
  def voucher_reminder_email(user, coupons)
    @user = user
    @coupons = coupons
    mail(:to => user.email, :subject => "Reminder - Use your vouchers before they expire!")
  end
end
