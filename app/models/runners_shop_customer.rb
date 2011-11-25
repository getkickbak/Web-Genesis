class RunnersShopCustomer
  include DataMapper::Resource
  
  property :id, Serial
  property :name, String, :index => true, :default => ""
end