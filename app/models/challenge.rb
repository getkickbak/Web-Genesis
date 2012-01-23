require 'util/constant'

class Challenge
  include DataMapper::Resource

  property :id, Serial
  property :type, String, :required => true, :default => ""
  property :name, String, :required => true, :default => ""
  property :description, String, :required => true, :default => ""
  property :require_verif, Boolean, :required => true, :default => false
  property :auth_code, String, :default => ""
  property :qr_code, String, :default => ""
  property :data, Object
  property :points, Integer, :required => true
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false
  
  attr_accessor :venue_ids
  
  attr_accessible :type, :name, :description, :require_verif, :data, :points
  
  belongs_to :merchant
  has n, :challenge_venues
  has n, :venues, :through => :challenge_venues
    
  validates_with_method :check_data
  validates_with_method :points, :method => :check_points
  
  def self.create(merchant, challenge_info, venues)
    now = Time.now
    challenge = Challenge.new(
      :type => challenge_info[:type],
      :name => challenge_info[:name],
      :description => challenge_info[:description],
      :require_verif => challenge_info[:require_verif],
      :points => challenge_info[:points]
    )
=begin    
    if challenge_info[:require_verif]
      auth_code = String.random_alphanumeric
      filename = generate_qr_code(merchant.merchant_id, auth_code)
      challenge[:auth_code] = auth_code
      challenge[:qr_code] = filename 
    end
=end    
    if challenge_info.include? :data
      challenge[:data] = challenge_info[:data]
    end
    challenge[:created_ts] = now
    challenge[:update_ts] = now
    challenge.merchant = merchant
    challenge.venues.concat(venues)
    challenge.save
    return challenge
  end
  
  def update(challenge_info, venues)
    now = Time.now
    self.type = challenge_info[:type]
    self.name = challenge_info[:name]
    self.description = challenge_info[:description]
    self.points = challenge_info[:points]
=begin    
    if !self.require_verif && challenge_info[:require_verif]
      auth_code = String.random_alphanumeric
      filename = generate_qr_code(merchant.merchant_id, auth_code)
      challenge[:auth_code] = auth_code
      challenge[:qr_code] = filename 
    end
=end    
    self.require_verif = challenge_info[:require_verif]
    if challenge_info.include? :data
      self.data = challenge_info[:data]
    end
    self.update_ts = now
    self.challenge_venues.destroy
    self.venues.concat(venues)
    save
  end
  
  def update_without_save(challenge_info)
    self.type = challenge_info[:type]
    self.name = challenge_info[:name]
    self.description = challenge_info[:description]
    self.points = challenge_info[:points]
    self.require_verif = challenge_info[:require_verif]
    if challenge_info.include? :data
      self.data = challenge_info[:data]
    end
  end
  
  def update_qr_code
    now = Time.now
    auth_code = String.random_alphanumeric
    filename = generate_qr_code(self.merchant.merchant_id, auth_code)
    self.auth_code = auth_code
    self.qr_code = filename
    self.update_ts = now
    save  
  end
  
  def as_json(options)
    only = {:only => [:id,:name,:description,:require_verif,:points]}
    options = options.nil? ? only : options.merge(only)
    super(options)
  end
  
  def destroy
    self.challenge_venues.destroy
    super  
  end
  
  private
  
  def check_data
    if self.data
      if self.type == 'checkin'
        self.data = CheckInData.new(self.data)
      elsif self.type == 'lottery'
        self.data = LotteryData.new(self.data)  
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
  
  def check_points
    if self.points.is_a? Integer
      return self.points > 0 ? true : [false, "Points must be greater than 0"]  
    end
    return true
  end
    
  def generate_qr_code(merchant_id, auth_code)
    qr = RQRCode::QRCode.new( auth_code, :size => 5, :level => :h )
    png = qr.to_img.resize(90,90)
    AWS::S3::S3Object.store(
      ::Common.generate_merchant_qr_code_file_path(merchant_id,"#{auth_code}.png"), 
      png.to_string,
      APP_PROP["AMAZON_FILES_BUCKET"], 
      :content_type => 'image/png', 
      :access => :public_read
    )
    filename = ::Common.generate_full_merchant_qr_code_file_path(merchant_id,"#{auth_code}.png")
  end
end