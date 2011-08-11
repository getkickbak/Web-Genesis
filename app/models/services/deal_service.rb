require 'singleton'

class DealService
  include Singleton
  
  def create_deal(merchant, deal_info)
    now = Time.now
    start_date = DateTime.new(deal_info['start_date(1i)'].to_i,deal_info['start_date(2i)'].to_i,deal_info['start_date(3i)'].to_i)
    end_date = DateTime.new(deal_info['end_date(1i)'].to_i,deal_info['end_date(2i)'].to_i,deal_info['end_date(3i)'].to_i)
    expiry_date = DateTime.new(deal_info['expiry_date(1i)'].to_i,deal_info['expiry_date(2i)'].to_i,deal_info['expiry_date(3i)'].to_i)
    deal = Deal.new(
      :title => deal_info[:title],
      :description => deal_info[:description],
      :photo_url => deal_info[:photo_url],
      :location => deal_info[:location],
      :regular_price => deal_info[:regular_price],
      :discount_price => deal_info[:discount_price],
      :start_date => start_date,
      :end_date => end_date,
      :expiry_date => expiry_date,
      :max_per_person => deal_info[:max_per_person],
      :max_limit => deal_info[:max_limit]
    )
    deal[:created_ts] = now
    deal[:update_ts] = now
    deal.merchant = merchant
    deal.save
    return deal
  end
  
  def get_deal(deal_id)
    Deal.get!(deal_id)
  end
  
  def get_deals(merchant_id, start, max)
    count = Deal.count(Deal.merchant.id => merchant_id)
    deals = Deal.all(Deal.merchant.id => merchant_id, :offset => start, :limit => max)  
    return deals
  end
  
  def update_deal(deal, deal_info)
    now = Time.now
    deal.attributes = deal_info
    deal.update_ts = now
    deal.save    
  end
  
  def remove_deal
    
  end
end