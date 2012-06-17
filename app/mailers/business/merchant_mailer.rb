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
      mail(:to => 'wayofdragon@gmail.com', :subject => (I18n.t("business.mailer.email_subject_summary_newsletter") % [@merchant.name]))
    end
    
    def invoice_email(invoice)
      @invoice = invoice
      mail(:to => 'wayofdragon@gmail.com', :subject => (I18n.t("business.mailer.email_subject_invoice") % [@invoice.invoice_id]))
    end
  end
end 