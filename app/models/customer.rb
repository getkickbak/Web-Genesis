require 'util/constant'

class Customer
  include DataMapper::Resource

  property :id, Serial
  property :auth_code, String, :unique_index => true, :required => true, :default => ""
  property :points, Integer, :default => 0
  property :visits, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  has 1, :last_check_in, 'CheckIn', :constraint => :destroy
  belongs_to :merchant, :key => true
  belongs_to :user, :key => true
  
  def self.create(merchant, user)
    now = Time.now
    auth_code = "#{String.random_alphanumeric}-#{merchant.id}-#{user.id}"
    customer = Customer.new
    customer[:auth_code] = auth_code
    customer[:created_ts] = now
    customer[:update_ts] = now
    customer.merchant = merchant
    customer.user = user
    customer.save
    return customer
  end
  
  def self.find(user_id, start, max)
    count = Customer.count(Customer.user.id => user_id) || 0
    customers = Customer.all(Customer.user.id => user_id, :order => [ :created_ts.desc ], :offset => start, :limit => max)
    result = {}
    result[:total] = count
    result[:items] = customers
    return result 
  end
  
  def update_qr_code
    now = Time.now
    new_auth_code = String.random_alphanumeric
    self.auth_code = new_auth_code
    self.update_ts = now
    save  
  end
end