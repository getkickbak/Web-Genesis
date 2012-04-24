class ChallengeType
  include DataMapper::Resource

  @@values = {}
  @@value_to_id = {}
  @@value_to_name = {}
  @@id_to_value = {}

  property :id, Serial
  property :value, String, :required => true, :default => ""

  def self.values
    @@values
  end
  
  def self.values=(values)
    @@values = values  
  end
  
  def self.value_to_id
    @@value_to_id  
  end
  
  def self.value_to_id=(value_to_id)
    @@value_to_id = value_to_id  
  end
  
  def self.value_to_name
    @@value_to_name
  end
  
  def self.value_to_name=(value_to_name)
    @@value_to_name = value_to_name
  end
  
  def self.id_to_value
    @@id_to_value
  end
  
  def self.id_to_value=(id_to_value)
    @@id_to_value = id_to_value
  end
end