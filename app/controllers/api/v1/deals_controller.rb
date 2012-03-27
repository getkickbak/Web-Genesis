require 'util/constant'

class Api::V1::DealsController < ApplicationController
  before_filter :authenticate_user!, :except => [:index, :show]
  #load_and_authorize_resource

  def show
    if params[:merchant_id]
    @merchant = Merchant.get(params[:merchant_id]) || not_found
    authorize! :read, @merchant
    end

    @deal = Deal.first(:deal_id => params[:id]) || not_found
    authorize! :read, @deal

    redirect = false
    @show_reward = false

    if params[:referral_id]
    @referral = Referral.first(:referral_id => params[:referral_id], :confirmed => true)
    end

    if signed_in? && @referral.nil?
      @referral = Referral.first(:deal_id => @deal.id, :confirmed => true, :creator_id => current_user.id)
      if @referral
      redirect = true
      end
    end

    if params[:id] && !redirect
      respond_to do |format|
        if params[:notice].nil?
        format.html # show.html.erb
        #format.xml  { render :xml => @deal }
        else
          format.html {
            flash[:notice] = params[:notice]
            render "show"
          }
        end
      end
    else
      parameters = ""
      if @referral
      parameters = "?referral_id=#{@referral.referral_id}"
      end
      respond_to do |format|
        format.html { redirect_to deal_path(@deal)+parameters }
      end
    end
  end
end