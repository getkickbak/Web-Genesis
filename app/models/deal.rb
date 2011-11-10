require 'util/constant'

class Deal
  include DataMapper::Resource
  include ApplicationHelper

  property :id, Serial
  property :deal_id, String, :unique_index => true, :default => ""
  property :title, String, :required => true, :default => ""
  property :description, String, :length => 4096, :required => true, :default => ""
  property :mini_description, String, :default => ""
  property :highlights, String, :length => 512, :required => true, :default => ""
  property :details, String, :length => 512, :required => true, :default => ""
  property :photo_urls, String, :length => 1024, :required => true, :default => ""
  property :location, String, :required => true, :default => ""
  property :start_date, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :end_date, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :expiry_date, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :max_per_person, Integer, :required => true, :default => 0
  property :max_limit, Integer, :default => 0
  property :limit_count, Integer, :default => 0
  property :reward_title, String, :required => true, :default => ""
  property :reward_details, String, :length => 512, :required => true, :default => ""
  property :reward_expiry_date, DateTime, :required => true, :default => ::Constant::MIN_TIME
  property :max_reward, Integer, :required => true, :default => 0
  property :reward_count, Integer, :default => 0
  property :reward_secret_code, String, :default => ""
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false

  attr_accessor :start_date_str, :end_date_str, :expiry_date_str, :reward_expiry_date_str
  attr_accessible :title, :description, :photo_urls, :highlights, :details, :location, :start_date,
                  :end_date, :expiry_date, :max_per_person, :max_limit, :reward_title, :reward_details, :reward_expiry_date,
                  :max_reward, :max_reward_count, :subdeals_attributes, :referral_subjects_attributes

  has n, :referral_subjects, :order => [ :seq_num.asc ]
  has n, :subdeals, :order => [ :discount_price.desc ]
  belongs_to :merchant

  accepts_nested_attributes_for :referral_subjects, :allow_destroy => true, :reject_if => lambda { |s| s[:content].blank? }
  accepts_nested_attributes_for :subdeals, :allow_destroy => true, :reject_if => lambda { |s| s[:title].blank? || s[:coupon_title].blank? || s[:regular_price].blank? || s[:discount_price].blank? }

  validates_with_method :validate_min_subdeals, :validate_min_referral_subjects, :validate_start_date, :validate_end_date, :validate_expiry_date, 
                        :validate_reward_expiry_date, :validate_max_limit, :validate_max_reward
  
  before :save, :minimize_description
  
  def self.create(merchant, deal_info)
    now = Time.now
    dates = ["start_date","end_date","expiry_date"]
    r = {}
    dates.each do |d|
      r[d] = deal_info[d+"(1i)"]+'-'+deal_info[d+"(2i)"]+'-'+deal_info[d+"(3i)"]
    end
    deal = Deal.new(
      :title => deal_info[:title].strip,
      :description => deal_info[:description].strip,
      :highlights => deal_info[:highlights].strip,
      :details => deal_info[:details].strip,
      :photo_urls => deal_info[:photo_urls].strip,
      :location => deal_info[:location].strip,
      :start_date => now,
      :end_date => now,
      :expiry_date => now,
      :max_per_person => deal_info[:max_per_person],
      :max_limit => deal_info[:max_limit],
      :reward_title => deal_info[:reward_title],
      :reward_details => deal_info[:reward_details],
      :reward_expiry_date => now,
      :max_reward => deal_info[:max_reward],
      :subdeals_attributes => deal_info[:subdeals_attributes] ? deal_info[:subdeals_attributes] : {},
      :referral_subjects_attributes => deal_info[:referral_subjects_attributes] ? deal_info[:referral_subjects_attributes] : {}

    )
    deal.start_date_str = r["start_date"]
    deal.end_date_str = r["end_date"]
    deal.expiry_date_str = r["expiry_date"]
    deal[:deal_id] = merchant.merchant_id
    deal[:reward_secret_code] = String.random_alphanumeric
    deal[:created_ts] = now
    deal[:update_ts] = now
    deal.merchant = merchant
    deal.save
    return deal
  end

  def self.find(merchant_id, start, max)
    count = Deal.count(Deal.merchant.id => merchant_id)
    deals = Deal.all(Deal.merchant.id => merchant_id, :offset => start, :limit => max)
    return deals
  end

  def to_param
    self.deal_id
  end
  
  def update(deal_info)
    now = Time.now
    self.title = deal_info[:title].strip
    self.description = deal_info[:description].strip
    self.highlights = deal_info[:highlights].strip
    self.details = deal_info[:details].strip
    self.photo_urls = deal_info[:photo_urls].strip
    self.location = deal_info[:location].strip
    dates = ["start_date","end_date","expiry_date","reward_expiry_date"]
    r = {}
    dates.each do |d|
      r[d] = deal_info[d+"(1i)"]+'-'+deal_info[d+"(2i)"]+'-'+deal_info[d+"(3i)"]
    end
    self.start_date_str = r["start_date"]
    self.end_date_str = r["end_date"]
    self.expiry_date_str = r["expiry_date"]
    self.max_per_person = deal_info[:max_per_person]
    self.max_limit = deal_info[:max_limit]
    self.reward_title = deal_info[:reward_title]
    self.reward_details = deal_info[:reward_details]
    self.reward_expiry_date_str = r["reward_expiry_date"]
    self.max_reward = deal_info[:max_reward]
    self.subdeals_attributes = deal_info[:subdeals_attributes] ? deal_info[:subdeals_attributes] : {}
    self.referral_subjects_attributes = deal_info[:referral_subjects_attributes] ? deal_info[:referral_subjects_attributes] : {}
    self.update_ts = now
    save
  end

  private
  
  def minimize_description
    mini_desc = helpers.strip_tags(self.description)
    if mini_desc.length > 255
      self.mini_description = mini_desc[0..251] + "..."
    else
      self.mini_description = mini_desc
    end
  end
  
  def convert_date(field, field_str)
    begin
      date_str = self.send(field_str)
      if date_str
        self[field] = DateTime.parse(date_str)
      end  
      return true
    rescue ArgumentError
      return false
    end
  end
  
  def validate_min_referral_subjects
    self.referral_subjects.length > 0 ? true : [false, "Need at least 1 referral subject"]  
  end
  
  def validate_min_subdeals
    self.subdeals.length > 0 ? true : [false, "Need at least 1 subdeal"]
  end
  
  def validate_start_date
    validate_date("start_date", "start_date_str")
  end
  
  def validate_end_date
    validate_date("end_date", "end_date_str")
  end
  
  def validate_expiry_date
    validate_date("expiry_date", "expiry_date_str")
  end
  
  def validate_reward_expiry_date
    validate_date("reward_expiry_date", "reward_expiry_date_str")  
  end
  
  def validate_date(n,v)
    convert_date(n.to_sym, v) ? true : [false, n.gsub('_',' ').capitalize + " is not valid"] 
  end
  
  def validate_max_limit
    self.max_limit > 0 ? true : [false, "Max Limit must be greater than 0"]
  end
  
  def validate_max_reward
    self.max_reward > 0 ? true : [false, "Max Reward must be greater than 0"]
  end
end
