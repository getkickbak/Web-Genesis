require 'util/constant'

class Invoice
  include DataMapper::Resource
  
  property :id, Serial
  property :invoice_id, Integer, :required => true, :default => ""
  property :amount, Decimal, :required => true, :default => 0.00
  property :transactions, Integer, :required => true, :default => 0
  property :monthly_fee, Decimal, :required => true, :default => 0.00
  property :cost_per_trans, Decimal, :required => true, :default => 0.00
  property :start_date, Date, :required => true, :default => ::Constant::MIN_DATE
  property :end_date, Date, :required => true, :default => ::Constant::MIN_DATE
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :invoice_id, :amount, :transactions, :monthly_fee, :cost_per_trans
  
  def self.create(merchant, invoice_info)
    now = Time.now
    invoice = Invoice.new(
      :invoice_id => "#{merchant.id}-#{now.to_i}",
      :amount => invoice_info[:amount],
      :transactions => invoice_info[:transactions],
      :monthly_fee => invoice_info[:monthly_fee],
      :cost_per_trans => invoice_info[:cost_per_trans],
      :start_date => invoice_info[:start_date],
      :end_date => invoice_info[:end_date]
    )
    invoice[:created_ts] = now
    invoice[:update_ts] = now
    invoice.merchant = merchant
    invoice.save
    return invoice  
  end
  
  belongs_to :merchant
  
  def to_param
    self.invoice_id
  end
end