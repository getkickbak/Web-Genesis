class SessionsController < ApplicationController
  def create
    User.transaction do
      begin
        user = User.first(:facebook_id => params[:facebook_id])
        if user.nil?
          user = User.create(params)
        else
          account_info = {
            :name => params[:name],
            :email => params[:email],
            :facebook_uid => params[:facebook_uid]
          }
          user.update(account_info)
          profile_info = {
            :gender => params[:gender],
            :birthday => params[:birthday]
          }
          user.profile.update(profile_info)
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