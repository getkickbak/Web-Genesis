require 'util/constant'

class GiftOption
  include DataMapper::Resource

  property :id, Serial
  property :from, String, :required => true
  property :to, String, :required => true
  property :message, String, :length => 512, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :from, :to, :to_email, :message

  belongs_to :order
end