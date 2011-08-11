require 'util/constant'

class Deal
  include DataMapper::Resource

  property :id, Serial
  property :title, String, :required => true
  property :description, String, :required => true
  property :photo_url, String, :default => ""
  property :location, String, :required => true
  property :regular_price, Decimal, :scale => 2, :required => true
  property :discount_price, Decimal, :scale => 2, :required => true 
  property :start_date, DateTime, :required => true
  property :end_date, DateTime, :required => true
  property :expiry_date, DateTime, :required => true
  property :max_per_person, Integer, :required => true
  property :max_limit, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :title, :description, :photo_url, :location, :regular_price, :discount_price, :start_date, 
                  :end_date, :expiry_date, :max_per_person, :max_limit
                  
  belongs_to :merchant
end
