class SessionsController < ApplicationController
  def create
    User.transaction do
      begin
        user = User.first(:email => params[:email])
        if user.nil?
          user = User.create(params)
        end
        sign_in(user)
        respond_to do |format|
          format.html { redirect_back_or(default_deal_path) }
          format.json { render :json => { :success => true } }
        end
      rescue
        respond_to do |format|
          format.html { redirect_back_or(default_deal_path) }
          format.json { render :json => { :success => false } }
        end
      end
    end
  end

  def destroy
    begin
      sign_out
      respond_to do |format|
        format.html { redirect_back_or(default_deal_path) }
        format.json { render :json => { :success => true } }
      end
    rescue
      respond_to do |format|
        format.html { redirect_back_or(default_deal_path) }
        format.json { render :json => { :success => false } }
      end
    end
  end
end