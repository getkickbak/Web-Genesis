require 'util/constant'

class Badge
  include DataMapper::Resource

  property :id, Serial
  property :custom, Boolean, :required => true, :default => false
  property :visits, Integer, :required => true, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :type_id, :eager_load_type
  
  has 1, :badge_to_type, :constraint => :destroy
  has 1, :type, 'BadgeType', :through => :badge_to_type,  :via => :badge_type
  has 1, :custom_type, 'MerchantBadgeType', :constraint => :destroy
  
  def rank
    if self.custom
      self.custom_type.rank
    else
      if self.eager_load_type
        self.eager_load_type.rank
      else
        self.type.rank
      end
    end
  end
end
