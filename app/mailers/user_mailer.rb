require 'util/common'

class UserMailer < ActionMailer::Base
  default :from => "JustForMyFriends <notification@justformyfriends.com>"
  
  def order_confirmed_email(order, is_gift)
    @order = order
    @referral_id = Referral.get(order.referral_id).referral_id
    @is_gift = is_gift
    @subdeal = Subdeal.get(@order.subdeal_id)
    mail(:to => @order.user.email, :subject => "Order Confirmation - " + @order.deal.title)
  end
  
  def contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'help@justformyfriends.com', :subject => @contact.topic)
  end
  
  def merchant_contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'business_help@justformyfriends.com', :subject => @contact.topic)  
  end
  
  def add_merchant_contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'add_business@justformyfriends.com', :subject => 'Business Inquiry')
  end
  
  def voucher_reminder_email(user, coupons)
    @user = user
    @coupons = coupons
    mail(:to => user.email, :subject => "Reminder - Use your vouchers before they expire!")
  end
end
