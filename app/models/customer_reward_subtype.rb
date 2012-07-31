class CustomerRewardSubtype
  include DataMapper::Resource

  @@values = {}
  @@value_to_name = {}
  @@id_to_type = {}

  property :id, Serial
  property :merchant_type_id, Integer, :required => true, :default => 0
  property :value, String, :required => true, :default => ""
    
  belongs_to :customer_reward_type
  
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
  
  def display_value
    @@value_to_name[self.value][I18n.locale]
  end
end