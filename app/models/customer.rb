require 'util/constant'

class Customer
  include DataMapper::Resource

  property :id, Serial
  property :auth_code, String, :unique_index => true, :required => true, :default => ""
  property :points, Integer, :default => 0
  property :prize_points, Integer, :default => 0
  property :visits, Integer, :default => 0
  property :next_badge_visits, Integer, :default => 0
  property :eligible_for_reward, Boolean, :default => false
  property :eligible_for_prize, Boolean, :default => false
  property :status, Enum[:active, :pending, :suspended, :deleted], :default => :active
  property :badge_reset_ts, DateTime, :default => ::Constant::MIN_TIME
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
    
  attr_accessor :eager_load_badge, :eager_load_merchant
    
  has 1, :last_check_in, 'CheckIn', :constraint => :destroy
  has 1, :customer_to_badge, :constraint => :destroy
  has 1, :badge, :through => :customer_to_badge,  :via => :badge
  
  belongs_to :merchant
  belongs_to :user
  
  def self.create(merchant, user)
    now = Time.now
    auth_code = "#{String.random_alphanumeric}-#{merchant.id}-#{user.id}"
    customer = Customer.new
    customer[:auth_code] = auth_code
    customer[:badge_reset_ts] = now
    customer[:created_ts] = now
    customer[:update_ts] = now
    badges = merchant.badges.sort_by { |b| b.rank }
    customer.badge = badges.first
    customer.merchant = merchant
    customer.user = user
    customer.save
    return customer
  end
  
  def self.find(user_id, start, max)
    count = Customer.count(:user_id => user_id)
    customers_info = Customer.all(:fields => [:id, :merchant_id], :user_id => user_id, :status => :active, :order => [ :created_ts.desc ], :offset => start, :limit => max)
    merchant_ids = []
    merchant_id_to_customer_id = {}
    customers_info.each do |customer_info|
      merchant_ids << customer_info.merchant_id
      merchant_id_to_customer_id[customer_info.merchant_id] = customer_info.id
    end
    merchants = Merchant.all(:id => merchant_ids)
    customer_id_to_merchant = {}
    merchants.each do |merchant|
      customer_id_to_merchant[merchant_id_to_customer_id[merchant.id]] = merchant
    end
    customers = Customer.all(:user_id => user_id, :status => :active, :order => [ :created_ts.desc ], :offset => start, :limit => max)
    customers.each do |customer|
      customer.eager_load_merchant = customer_id_to_merchant[customer.id]
    end
    merchant_id_to_type_id = {}
    merchant_to_types = MerchantToType.all(:fields => [:merchant_id, :merchant_type_id], :merchant_id => merchant_ids)
    merchant_to_types.each do |merchant_to_type|
      merchant_id_to_type_id[merchant_to_type.merchant_id] = merchant_to_type.merchant_type_id
    end
    customers.each do |customer|
      customer.eager_load_merchant.eager_load_type = MerchantType.id_to_type[merchant_id_to_type_id[customer.eager_load_merchant.id]]
    end
    result = {}
    result[:total] = count
    result[:items] = customers
    return result 
  end
  
  def mutex_key
    "CustomerMutex-#{self.id}"  
  end
  
  def update_qr_code
    now = Time.now
    new_auth_code = String.random_alphanumeric
    self.auth_code = new_auth_code
    self.update_ts = now
    save  
  end
end