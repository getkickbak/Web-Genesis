class PagesController < ApplicationController
    
  def how_it_works
  end

  def contact_us  
    @contact = Contact.new
  end
  
  def contact_us_create
    UserMailer.contact_email(params[:contact]).deliver
    respond_to do |format|
      format.html { redirect_to(:action => "contact_us", :notice => 'Email was successfully sent.') }
    end
  end
  
  def terms
  end
  
  def privacy
  end
end
