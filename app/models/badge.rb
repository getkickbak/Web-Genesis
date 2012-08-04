require 'util/constant'

class Badge
  include DataMapper::Resource

  property :id, Serial
  property :visits, Integer, :required => true, :default => 0
  property :rank, Integer, :required => true, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :type_id, :eager_load_type
  
  has 1, :badge_to_type, :constraint => :destroy
  has 1, :type, 'BadgeType', :through => :badge_to_type,  :via => :badge_type
  
  def rank
    self.type.rank
  end
end
