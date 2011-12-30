module Business
  class PagesController < BaseApplicationController
    before_filter :authenticate_merchant!, :only => [:merchant_terms]
    skip_authorization_check

    def contact_us
      @contact = Contact.new
      @notice = request.filtered_parameters['notice']
    end

    def contact_us_create
      @contact = Contact.new(params[:contact])
      if @contact.valid?
        UserMailer.contact_email(@contact).deliver
        respond_to do |format|
          format.html { redirect_to(:action => "contact_us", :notice => 'Email was successfully sent.') }
        end
      else
        respond_to do |format|
          format.html { render :action => "contact_us" }
        end
      end
    end
    
    def merchant_terms
    end
  end
end
