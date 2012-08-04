class BadgeType
  include DataMapper::Resource

  @@values = {}
  @@value_to_name = {}
  @@id_to_type = {}
  @@visits = {}
  
  property :id, Serial
  property :value, String, :required => true, :default => ""
  property :rank, Integer, :required => true, :default => 0
        
  attr_accessor :thumbnail_small_url, :thumbnail_medium_url, :thumbnail_large_url
        
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
  
  def self.visits
    @@visits  
  end
  
  def self.visits=(visits)
    @@visits = visits  
  end
  
  def display_value
    @@value_to_name[self.value][I18n.locale]
  end
end