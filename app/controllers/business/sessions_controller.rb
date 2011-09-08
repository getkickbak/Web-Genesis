class Business::SessionsController < Business::ApplicationController
  
  def create
    Merchant.transaction do
      begin
        merchant = Merchant.first(:email => params[:email])
        if merchant.nil?
          merchant = Merchant.create(params)
        end
        sign_in(merchant)
        redirect_back_or(coupons_path)
      end
    end
  end
  
  def destroy
    sign_out
    redirect_back_or(coupons_path)
  end
end