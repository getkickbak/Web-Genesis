require 'util/constant'

class RewardModel
  include DataMapper::Resource
  
  property :id, Serial
  property :signup_amount, Decimal, :scale => 2, :default => 0.00
  property :signup_points, Integer, :required => true, :min => 1
  property :rebate_rate, Integer, :min => 1
  property :badge_rebate_rate, Integer, :min => 1, :default => 1
  property :prize_rebate_rate, Integer, :min => 1
  property :price_per_point, Decimal, :scale => 2, :min => 1.00, :default => 1.00
  property :price_per_prize_point, Decimal, :scale => 2, :min => 1.00, :default => 1.00
  property :expected_avg_spend, Decimal, :scale => 2, :default => 0.00
  property :avg_spend, Decimal, :scale => 2, :default => 0.00
  property :total_visits, Integer, :default => 0
  property :created_ts, DateTime, :default => ::Constant::MIN_TIME
  property :update_ts, DateTime, :default => ::Constant::MIN_TIME
  property :deleted_ts, ParanoidDateTime
  #property :deleted, ParanoidBoolean, :default => false  
  
  attr_accessor :type_id
  
  attr_accessible :type_id, :signup_amount, :signup_points, :rebate_rate, :badge_rebate_rate, :prize_rebate_rate, :price_per_point, :price_per_prize_point, :expected_avg_spend
  
  belongs_to :merchant
  has 1, :reward_model_to_type, :constraint => :destroy
  has 1, :type, 'RewardModelType', :through => :reward_model_to_type, :via => :reward_model_type
  
  validates_presence_of :signup_amount, :if => lambda { |t| !t.type_id.nil? && RewardModelType.id_to_value[t.type_id] == "amount_spent"  }
  validates_presence_of :rebate_rate, :if => lambda { |t| !t.type_id.nil? && RewardModelType.id_to_value[t.type_id] == "amount_spent"  }
  validates_presence_of :prize_rebate_rate, :if => lambda { |t| !t.type_id.nil? && RewardModelType.id_to_value[t.type_id] == "amount_spent"  }
  validates_presence_of :expected_avg_spend, :if => lambda { |t| !t.type_id.nil? && RewardModelType.id_to_value[t.type_id] == "amount_spent"  }
  validates_with_method :signup_amount, :method => :check_signup_amount, :if => lambda { |t| !t.type_id.nil? && RewardModelType.id_to_value[t.type_id] == "amount_spent"  }
  validates_with_method :expected_avg_spend, :method => :check_expected_avg_spend, :if => lambda { |t| !t.type_id.nil? && RewardModelType.id_to_value[t.type_id] == "amount_spent"  }
  validates_with_method :type_id, :method => :check_type_id
  
  def self.create(merchant, type, reward_model_info)
    now = Time.now
    reward_model = RewardModel.new(
      {
        :type_id => type ? type.id : nil,
        :signup_amount => reward_model_info[:signup_amount],
        :signup_points => reward_model_info[:signup_points],
        :rebate_rate => reward_model_info[:rebate_rate],
        :badge_rebate_rate => reward_model_info[:badge_rebate_rate],
        :prize_rebate_rate => reward_model_info[:prize_rebate_rate],
        #:price_per_point => reward_model_info[:price_per_point],
        #:price_per_prize_point => reward_model_info[:price_per_prize_point]
        :expected_avg_spend => reward_model_info[:expected_avg_spend]
      }.delete_if { |k,v| v.nil? }
    )
    reward_model[:created_ts] = now
    reward_model[:update_ts] = now
    reward_model.merchant = merchant
    reward_model.type = type
    reward_model.save
    return reward_model
  end
  
  def update_all(type, reward_model_info)
    now = Time.now
    self.type_id = type ? type.id : nil
    self.signup_amount = reward_model_info[:signup_amount] if reward_model_info[:signup_amount]
    self.signup_points = reward_model_info[:signup_points]
    self.rebate_rate = reward_model_info[:rebate_rate] if reward_model_info[:rebate_rate]
    self.badge_rebate_rate = reward_model_info[:badge_rebate_rate] if reward_model_info[:badge_rebate_rate]
    self.prize_rebate_rate = reward_model_info[:prize_rebate_rate] if reward_model_info[:prize_rebate_rate]
    #self.price_per_point = reward_model_info[:price_per_point]
    #self.price_per_prize_point = reward_model_info[:price_per_prize_point]
    self.expected_avg_spend = reward_model_info[:expected_avg_spend] if reward_model_info[:expected_avg_spend]
    self.update_ts = now
    self.type = type
    save
  end
  
  private
  
  def check_signup_amount
    return self.signup_amount >= 1.00 ? true : [false, ValidationErrors.default_error_message(:greater_than_or_equal_to, :signup_amount, 1.00)]
  end
  
  def check_expected_avg_spend
    return self.expected_avg_spend >= 1.00 ? true : [false, ValidationErrors.default_error_message(:greater_than_or_equal_to, :expected_avg_spend, 1.00)]
  end
  
  def check_type_id
    if self.type
      return true  
    end
    return [false, ValidationErrors.default_error_message(:blank, :type_id)]
  end
end