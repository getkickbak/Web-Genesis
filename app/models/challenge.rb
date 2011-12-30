require 'util/constant'

class Challenge
  include DataMapper::Resource

  property :id, Serial
  property :type, String, :required => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :description, String, :required => true, :default => ""
  property :require_verif, Boolean, :required => true, :default => false
  property :data, Object
  property :points, Integer, :required => true
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessible :type, :name, :description, :require_verif, :data, :points
  
  belongs_to :merchant
  
  validates_with_method :check_data
  validates_with_method :points, :method => :check_points
  
  def self.create(merchant, challenge_info)
    now = Time.now
    challenge = Challenge.new(
      :type => challenge_info[:type],
      :name => challenge_info[:name],
      :description => challenge_info[:description],
      :require_verif => challenge_info[:require_verif],
      :points => challenge_info[:points]
    )
    if challenge_info.include? :data
      challenge[:data] = challenge_info[:data]
    end
    challenge[:created_ts] = now
    challenge[:update_ts] = now
    challenge.merchant = merchant
    challenge.save
    return challenge
  end
  
  def update(challenge_info)
    now = Time.now
    self.type = challenge_info[:type]
    self.name = challenge_ifno[:name]
    self.description = challenge_info[:description]
    self.points = challenge_info[:points]
    self.require_verif = challenge_info[:require_verif]
    if challenge_info.include? :data
      self.data = challenge_info[:data]
    end
    self.update_ts = now
    save
  end
  
  private
  
  def check_data
    if self.data
      if self.type == 'checkin'
        self.data = CheckInData.new(self.data)
      end
      if !self.data.valid?
        self.data.errors.each do |key,value|
          self.errors.add(key,value)
        end
      end
    end
    return true
  end
  
  def check_points
    if self.points.is_a? Integer
      return self.points > 0 ? true : [false, "Points must be greater than 0"]  
    end
    return true
  end
end