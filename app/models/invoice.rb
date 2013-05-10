require 'util/constant'

class Invoice
  include DataMapper::Resource
  
  Roles = %w[recurring one-time]
  
  property :id, Serial
  property :type, Enum[:recurring, :one_time], :default => :recurring
  property :invoice_id, String, :required => true, :default => ""
  property :balance, Decimal, :scale => 2, :default => 0.00
  property :charges, Decimal, :scale => 2, :required => true, :default => 0.00
  property :proration, Decimal, :scale => 2, :default => 0.00
  property :tax, Decimal, :scale => 2, :default => 0.00
  property :amount, Decimal, :scale => 2, :required => true, :default => 0.00
  property :start_date, Date, :required => true, :default => ::Constant::MIN_DATE
  property :end_date, Date, :default => ::Constant::MIN_DATE
  property :paid, Boolean, :default => false
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :type, :invoice_id, :balance, :charges, :proration, :tax, :amount, :start_date, :end_date, :items_attributes
  
  has n, :items, 'InvoiceItem', :constraint => :destroy
  
  belongs_to :merchant

  accepts_nested_attributes_for :items, :allow_destroy => true, :reject_if => lambda { |t| t[:description].blank? || t[:quantity].blank? || t[:amount].blank? }

  validates_with_method :validate_min_items

  def self.create(merchant, invoice_info)
    now = Time.now
    invoice = Invoice.new(
      {
        :type => invoice_info[:type],
        :invoice_id => "#{merchant.id}-#{now.to_i}",
        :balance => invoice_info[:balance],
        :charges => invoice_info[:charges],
        :proration => invoice_info[:proration],
        :tax => invoice_info[:tax],
        :amount => invoice_info[:amount],
        :start_date => invoice_info[:start_date] || now,
        :end_date => invoice_info[:end_date],
        :items_attributes => invoice_info[:items_attributes] ? invoice_info[:items_attributes] : {},
      }.delete_if { |k,v| v.nil? }
    )
    invoice[:created_ts] = now
    invoice[:update_ts] = now
    invoice.merchant = merchant
    invoice.save
    return invoice  
  end
  
  private
  
  def validate_min_items
    if self.items.length > 0
      return true
    else
      errors[:base] << I18n.t("admin.invoices.min_items")
      return [false, I18n.t("admin.invoices.min_items")]
    end
  end
end