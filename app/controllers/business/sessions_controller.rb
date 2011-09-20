module Business
  class SessionsController < ApplicationController
    def new

    end

    def create
      merchant = Merchant.authenticate(params[:session][:email],
                                       params[:session][:password])
      if merchant.nil?
        flash.now[:error] = "Invalid email/password combination."
        render 'new'
      else
        sign_in merchant
        redirect_back_or(coupons_path)
      end
    end

    def destroy
      sign_out
      redirect_back_or(coupons_path)
    end
  end
end