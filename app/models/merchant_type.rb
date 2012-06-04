class MerchantType
  include DataMapper::Resource
  
  @@values = {}
  @@value_to_name = {}
  @@id_to_type = {}
  
  property :id, Serial
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
  
  def self.id_to_type
    @@id_to_type
  end
  
  def self.id_to_type=(id_to_type)
    @@id_to_type = id_to_type
  end
end