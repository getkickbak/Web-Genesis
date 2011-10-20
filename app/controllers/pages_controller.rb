class PagesController < ApplicationController
  def how_it_works
    @show_reward = true
  end

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

  def terms
  end

  def privacy
  end
  
  def merchant_terms
  end
end
