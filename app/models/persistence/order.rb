require 'util/constant'

class Order

  include DataMapper::Resource

  property :id, Serial
  property :order_num, String, :index => true, :default => ""
  property :user_id, Integer, :default => 0
  property :referral_id, Integer, :default => 0
  property :quantity, Integer, :required => true
  property :purchase_date, DateTime, :default => ::Constant::MIN_TIME
  property :total_payment, Decimal, :scale => 2, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessible :quantity

  belongs_to :deal
  has n, :coupons
end
