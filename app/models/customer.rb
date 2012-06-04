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
  belongs_to :merchant
  belongs_to :user
  
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
    merchant_ids = []
    customers.each do |customer|
      merchant_ids << customer.merchant.id
    end
    merchant_id_to_type_id = {}
    merchant_to_types = MerchantToType.all(:fields => [:merchant_id, :merchant_type_id], :merchant_id => merchant_ids)
    merchant_to_types.each do |merchant_to_type|
      merchant_id_to_type_id[merchant_to_type.merchant_id] = merchant_to_type.merchant_type_id
    end
    customers.each do |customer|
      customer.merchant.eager_load_type = MerchantType.id_to_type[merchant_id_to_type_id[customer.merchant.id]]
    end
    result = {}
    result[:total] = count
    result[:items] = customers
    return result 
  end
  
  def cache_key
    "Customer-#{self.id}"    
  end
  
  def update_qr_code
    now = Time.now
    new_auth_code = String.random_alphanumeric
    self.auth_code = new_auth_code
    self.update_ts = now
    save  
  end
end