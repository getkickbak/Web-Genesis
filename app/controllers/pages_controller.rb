class PagesController < ApplicationController
  skip_authorization_check
  before_filter :check_signed_in, :only => [:index, :add_business, :add_business_create]

  def index
  
  end
  
  def how_it_works
    @show_reward = true
  end

  def contact_us
    @contact = Contact.new
    @notice = request.filtered_parameters['notice']
    if signed_in?
      render :template => '/pages/alt_contact_us'
    end
  end

  def contact_us_create
    @contact = Contact.new(params[:contact])
    if @contact.valid?
      UserMailer.contact_email(@contact).deliver
      respond_to do |format|
        format.html { redirect_to(:action => 'contact_us', :notice => 'Email was successfully sent.') }
      end
    else
      if signed_in?
        render :template => '/pages/alt_contact_us'
      else
        respond_to do |format|
          format.html { render :action => 'contact_us' }
        end
      end
    end
  end

  def add_business
    @merchant_contact = MerchantContact.new
    @notice = request.filtered_parameters['notice']
  end

  def add_business_create
    @merchant_contact = MerchantContact.new(params[:merchant_contact])
    if @merchant_contact.valid?
      UserMailer.add_merchant_contact_email(@merchant_contact).deliver
      respond_to do |format|
        format.html { redirect_to(:action => 'add_business', :notice => 'Email was successfully sent.') }
      end
    else
      respond_to do |format|
        format.html { render :action => 'add_business' }
      end
    end
  end

  def coming_soon
      
  end
  
  def terms
  end

  def privacy
  end
  
  private
  
  def check_signed_in
    if signed_in?
      redirect_to dashboard_path
    end
  end
end
