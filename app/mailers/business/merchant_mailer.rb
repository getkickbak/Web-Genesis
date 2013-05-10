require 'util/common'

module Business
  class MerchantMailer < ActionMailer::Base
    default :from => "KICKBAK <mail@getkickbak.com>"
    def contact_email(contact)
      @contact = contact
      mail(:to => 'help@getkickbak.com', :subject => @contact.topic)
    end

    def summary_email(merchant, stats, mode = "merchant")
      @merchant = merchant
      @stats = stats
      to_email = merchant.email
      if merchant.role == "test" || mode == "system"
        to_email = "paul.chan@getkickbak.com"
      end
      mail(:to => to_email, :subject => (I18n.t("business.mailer.email_subject_summary") % [@merchant.name]))
    end
    
    def invoice_email(invoice, mode = "merchant")
      @invoice = invoice
      to_email = invoice.merchant.email
      if invoice.merchant.role == "test" || mode == "system"
        to_email = "paul.chan@getkickbak.com"
      end
      mail(:to => to_email, :subject => I18n.t("business.mailer.email_subject_invoice"))
    end
  end
end 