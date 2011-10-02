require 'util/constant'

class GiftOption
  include DataMapper::Resource

  property :id, Serial
  property :from, String, :required => true, :default => ""
  property :to, String, :required => true, :default => ""
  property :to_email, String, :required => true, :default => ""
  property :message, String, :length => 512, :required => true, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :from, :to, :to_email, :message

  belongs_to :order
end