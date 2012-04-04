require 'util/constant'

class Challenge
  include DataMapper::Resource

  property :id, Serial
  property :name, String, :length => 20, :required => true, :default => ""
  property :description, String, :required => true, :default => ""
  property :require_verif, Boolean, :required => true, :default => false
  property :data, Object
  property :points, Integer, :required => true, :min => 1
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :type_id
  attr_accessor :venue_ids
  
  attr_accessible :type_id, :name, :description, :require_verif, :data, :points
  
  belongs_to :merchant
  has 1, :challenge_to_type, :constraint => :destroy
  has 1, :type, 'ChallengeType', :through => :challenge_to_type, :via => :challenge_type
  has n, :challenge_venues, :constraint => :destroy
  has n, :venues, :through => :challenge_venues
    
  validates_with_method :type_id, :method => :check_type_id
  validates_with_method :name, :method => :check_name
  validates_with_method :check_data
  validates_with_method :check_venues
  
  def self.create(merchant, type, challenge_info, venues)
    now = Time.now
    challenge = Challenge.new(
      :type_id => type ? type.id : nil,
      :name => challenge_info[:name].strip,
      :description => challenge_info[:description].strip,
      :require_verif => challenge_info[:require_verif],
      :points => challenge_info[:points]
    )
    if challenge_info.include? :data
      challenge[:data] = challenge_info[:data]
    end
    challenge[:created_ts] = now
    challenge[:update_ts] = now
    challenge.merchant = merchant
    challenge.type = type
    challenge.venues.concat(venues)
    challenge.save
    return challenge
  end
  
  def update(type, challenge_info, venues)
    now = Time.now
    self.type_id = type ? type.id : nil
    self.name = challenge_info[:name]
    self.description = challenge_info[:description]
    self.points = challenge_info[:points]   
    self.require_verif = challenge_info[:require_verif]
    if challenge_info.include? :data
      self.data = challenge_info[:data]
    end
    self.update_ts = now
    self.type = type
    self.challenge_venues.destroy
    self.venues.concat(venues)
    save
  end
  
  def update_without_save(challenge_info)
    self.type_id = nil
    self.type = nil
    self.name = challenge_info[:name]
    self.description = challenge_info[:description]
    self.points = challenge_info[:points]
    self.require_verif = challenge_info[:require_verif]
    if challenge_info.include? :data
      self.data = challenge_info[:data]
    end
  end
  
  def destroy
    self.challenge_venues.destroy
    super  
  end
  
  private
  
  def check_type_id
    if self.type && self.type.id
      return true  
    end
    return [false, I18n.t("errors.messages.challenge.type_blank")]
  end
  
  def check_name
    line_length = 10
    current_line_length = 0
    num_of_lines = 1
    words = self.name.split
    words.each do |word|
      if word.length > line_length 
        return [false, I18n.t("errors.messages.challenge.name_min_word_length")]
      end
      current_line_length += word.length
      if current_line_length > line_length
        num_of_lines += 1
        current_line_length = word.length 
      end
      current_line_length += 1
    end
    num_of_lines <= 2 ? true : [false, I18n.t("errors.messages.challenge.name_max_num_of_lines")]
  end
  
  def check_data
    if self.data
      if self.data.is_a? ActiveSupport::HashWithIndifferentAccess
        if self.type.value == 'vip'
          self.data = CheckInData.new(self.data)  
        end
      end
      if !self.data.valid?
        self.data.errors.each do |key,value|
          self.errors.add(key,value)
        end
        return false
      end
    end
    return true
  end
    
  def check_venues
    if self.venues.length == 0
      return [false, I18n.t("errors.messages.challenge.min_venues")]
    end
    return true
  end
end