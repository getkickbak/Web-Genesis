require 'util/constant'

class CheckInCode
  include DataMapper::Resource
  
  property :auth_code, String, :key => true
  property :qr_code, String, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  belongs_to :venue
end