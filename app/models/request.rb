require 'util/constant'

class Request
  include DataMapper::Resource
    
  property :id, Serial
  property :type, String, :required => true, :default => ""
  property :frequency1, Integer, :required => true, :default => 0
  property :frequency2, Integer, :required => true, :default => 0
  property :frequency3, Integer, :required => true, :default => 0
  property :latitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :longitude, Decimal, :precision => 20, :scale => 15, :required => true, :default => 0
  property :data, String, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  def self.create(request_info)
    now = Time.now
    request = Request.new(
      :type => request_info[:type],
      :frequency1 => request_info[:frequency1],
      :frequency2 => request_info[:frequency2],
      :frequency3 => request_info[:frequency3],
      :latitude => request_info[:latitude],
      :longitude => request_info[:longitude],
      :data => data
    )
    request[:created_ts] = now
    request[:update_ts] = now
    request.save
    return request
  end
end