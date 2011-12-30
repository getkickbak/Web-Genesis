require 'util/constant'

class Reward
  include DataMapper::Resource

  property :id, Serial
  property :type, Discriminator
  property :title, String, :required => true, :default => ""
  property :points, Integer, :required => true
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :title, :points
  
  belongs_to :merchant
  
  validates_with_method :check_points

  def update(reward_info)
    now = Time.now
    self.title = reward_info[:title]
    self.points = reward_info[:points]
    self.update_ts = now
    save
  end
    
  private
  
  def check_points
    self.points > 0 ? true : [false, "Points must be greater than 0"]  
  end
end