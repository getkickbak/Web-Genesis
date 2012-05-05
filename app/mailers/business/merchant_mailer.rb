require 'util/common'

module Business
  class MerchantMailer < ActionMailer::Base
    default :from => "KICKBAK <notification@getkickbak.com>"
    def contact_email(contact)
      @contact = contact
      mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'business_help@getkickbak.com', :subject => @contact.topic)
    end

    def summary_newsletter_email(merchant, stats)
      @merchant = merchant
      @stats = stats
      mail(:from => "", :to => 'wayofdragon@gmail.com', :subject => "Weekly Summary Newsletter - #{@merchant.name}")
    end
    
    def invoice_email(invoice)
      @invoice = invoice
      mail(:from => "", :to => 'wayofdragon@gmail.com', :subject => "Monthly KICKBAK Invoice ##{invoice.invoice_id}")
    end
  end
end