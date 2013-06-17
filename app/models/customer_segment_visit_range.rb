class CustomerSegmentVisitRange
  include DataMapper::Resource

  @@values = {}
  
  property :visit_frequency_type_id, Integer, :key => true
  property :value, String, :key => true
  property :period_in_months, Integer, :required => true, :default => 0
  property :low, Integer, :required => true, :default => 0
  property :high, Integer, :required => true, :default => 0

  def self.values
    @@values
  end
  
  def self.values=(values)
    @@values = values  
  end
end