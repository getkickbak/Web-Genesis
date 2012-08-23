require 'util/common'

module Business
  class MerchantMailer < ActionMailer::Base
    default :from => "KICKBAK <mail@getkickbak.com>"
    def contact_email(contact)
      @contact = contact
      mail(:from => "#{@contact.name} <#{@contact.email}>", :to => 'help@getkickbak.com', :subject => @contact.topic)
    end

    def summary_email(merchant, stats)
      @merchant = merchant
      @stats = stats
      to_email = merchant.email
      if merchant.role == "test"
        to_email = "paul.chan@getkickbak.com"
      end
      mail(:to => to_email, :subject => (I18n.t("business.mailer.email_subject_summary") % [@merchant.name]))
    end
    
    def invoice_email(invoice)
      @invoice = invoice
      to_email = invoice.merchant.email
      if merchant.role == "test"
        to_email = "paul.chan@getkickbak.com"
      end
      mail(:to => to_email, :subject => (I18n.t("business.mailer.email_subject_invoice") % [@invoice.invoice_id]))
    end
  end
end 