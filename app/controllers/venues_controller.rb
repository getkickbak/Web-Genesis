class VenuesController < ApplicationController
  before_filter :authenticate_user!
  #load_and_authorize_resource

  def find_nearest
    authorize! :read, Venue

    venues = Venue.find_nearest(params[:latitude],params[:longitude])
    respond_to do |format|
    #format.xml  { render :xml => referrals }
      format.json { render :json => { :success => true, :data => venues } }
    end
  end
end