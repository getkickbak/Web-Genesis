class VenuesController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource

  def find_nearest
    authorize! :read, Venue

    venues = Venue.find_nearest(params[:merchant_id], params[:latitude], params[:longitude], params[:start], params[:max])
    respond_to do |format|
    #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => venues.to_json } }
    end
  end
end