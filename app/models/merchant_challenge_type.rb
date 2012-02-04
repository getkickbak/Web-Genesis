class MerchantChallengeType
  include DataMapper::Resource  
  
  property :merchant_type_id, Integer, :key => true
  property :challenge_type_id, Integer, :key => true
end
