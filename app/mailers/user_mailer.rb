class UserMailer < ActionMailer::Base
  default :from => "JustForMyFriends <notification@justformyfriends.com>"
  
  def order_confirmed_email(order)
    @order = order
    @url  = order_url(@order)
    @order.coupons.each do |coupon|
      content = File.read(APP_PROP["COUPON_FILE_PATH"]+"#{coupon.coupon_id}.pdf")
      attachments["#{coupon.coupon_id}.pdf"] = {:mime_type => 'application/pdf',
                                                :data => content}
      
    end
    mail(:to => @order.user.email, :subject => "Order Confirmation - " + @order.deal.title)
  end
end
