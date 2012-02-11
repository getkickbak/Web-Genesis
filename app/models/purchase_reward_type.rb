class PurchaseRewardType
  include DataMapper::Resource

  @@values = {}
  @@value_to_name = {}
  
  property :id, Serial
  property :merchant_type_id, Integer, :required => true, :default => 0
  property :value, String, :required => true, :default => ""
  
  def self.values
    @@values
  end
  
  def self.values=(values)
    @@values = values  
  end
  
  def self.value_to_name
    @@value_to_name
  end
  
  def self.value_to_name=(value_to_name)
    @@value_to_name = value_to_name
  end
end