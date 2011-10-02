class UserMailer < ActionMailer::Base
  default :from => "JustForMyFriends <notification@justformyfriends.com>"
  
  def order_confirmed_email(order)
    @order = order
    @subdeal = Subdeal.get(@order.subdeal_id)
    @order.coupons.each do |coupon|
      content = File.read(APP_PROP["COUPON_FILE_PATH"]+"#{coupon.coupon_id}.pdf")
      attachments["#{coupon.coupon_id}.pdf"] = {:mime_type => 'application/pdf',
                                                :data => content}
    end
    mail(:to => @order.user.email, :subject => "Order Confirmation - " + @order.deal.title)
  end
  
  def reward_email(reward)
    @reward = reward
    content = File.read(APP_PROP["COUPON_FILE_PATH"]+"#{@reward.reward_code}.pdf")
    attachments["#{@reward.reward_code}.pdf"] = {:mime_type => 'application/pdf',
                                              :data => content}      
    mail(:to => @reward.user.email, :subject => "Reward - A C$2 Tim Horton Gift Card")
  end
  
  def contact_email(contact)
    @contact = contact
    mail(:from => "#{@contact[:name]} <#{@contact[:email]}>", :to => 'help@justformyfriends.com', :subject => @contact[:topic])
  end
end
